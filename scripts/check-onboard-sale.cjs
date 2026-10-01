// Run with: node scripts/check-onboard-sale.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parse, compileTemplate, compileStyle } = require('@vue/compiler-sfc');

const filename = path.join(__dirname, '../src/views/sales/OnBoardSaleDialog.vue');
const { descriptor, errors } = parse(fs.readFileSync(filename, 'utf8'));
assert.deepEqual(errors, []);
assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename, id: 'onboard-check' }).errors, []);
for (const style of descriptor.styles) {
  assert.deepEqual(compileStyle({ source: style.content, filename, id: 'data-v-onboard-check', scoped: true }).errors, []);
}

function mountLogic(request = async () => ({ success: true, data: { trips: [] } })) {
  const script = descriptor.script.content.replace(/import\s+\{\s*handleRequest\s*\}\s+from\s+[^;]+;/, '').replace('export default', 'return');
  const component = new Function('handleRequest', script)(request);
  const state = component.data();
  state.$nextTick = () => Promise.resolve();
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) {
    if (typeof getter === 'function') Object.defineProperty(state, name, { get: () => getter.call(state) });
  }
  return state;
}

function selectRoute(state) {
  const stop = (id, order, board = true, alight = true) => ({
    route_stop_id: id, stop_order: order, can_board: board, can_alight: alight,
    routeStop: { id, location: { id: id + 1000, address: `Parada ${order}` } },
  });
  const segment = (id, origin, destination, active = true) => ({
    id, origin_route_stop_id: origin, destination_route_stop_id: destination, active, currency: 'CLP', base_price: 9000,
    passenger_types: [
      { id: 601, ticket_type_id: 13, name: 'Adulto', price: 4000, base_price: 5000, active: true },
      { id: 602, ticket_type_id: 14, name: 'Estudiante', price: 2000, active: true },
      { id: 603, ticket_type_id: 15, name: 'Gratuito', price: 0, base_price: 9000, active: true },
      { id: 604, ticket_type_id: 16, name: 'Inactivo', price: 2000, active: false },
    ],
  });
  state.availableRoutes = [state.normalizeRoute({ id: 17, commercial: {
    tripStops: [stop(101, 1, true, false), stop(102, 2), stop(103, 3, false)],
    segments: [segment(501, 101, 102), segment(502, 102, 103), segment(503, 102, 101), segment(504, 101, 103, false)],
  } })];
  state.selectedRouteId = 17;
  state.selectedBranchId = 7;
  state.selectedVehicleId = 12;
}

async function run() {
  const state = mountLogic();
  selectRoute(state);
  state.selectedOriginStopId = 101;
  assert.deepEqual(state.destinationStopOptions.map(stop => stop.id), [102]);
  state.onDestinationStopChange(102);
  assert.equal(state.selectedFareSegmentId, 501, 'The sole segment should expose its passenger fares immediately');
  assert.deepEqual(state.passengerFares.map(fare => fare.id), [601, 602, 603]);
  state.setPassengerQuantity(601, '2');
  state.setPassengerQuantity(602, 3);
  state.setPassengerQuantity(603, 1);
  assert.equal(state.totalQuantity, 6);
  assert.equal(state.total, 14000, 'Use passenger price, preserve free fares and ignore segment base price');
  assert.deepEqual(state.ticketItems[0], { fare_segment_ticket_type_id: 601, ticket_type_id: 13, quantity: 2 });
  for (const invalid of [-1, 1.5, 'abc', Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    state.setPassengerQuantity(601, invalid);
    assert.ok(state.quantityErrors[601]);
    assert.equal(state.quantityFor(601), 0);
    assert.equal(state.total, 6000);
  }
  state.setPassengerQuantity(601, '');
  assert.equal(state.quantityErrors[601], undefined);
  state.setPassengerQuantity(601, 2);
  state.selectedOriginStopId = 102;
  state.onOriginStopChange();
  assert.equal(state.total, 0);
  assert.deepEqual(state.passengerQuantities, {});
  assert.deepEqual(state.destinationStopOptions.map(stop => stop.id), [103]);
  state.onDestinationStopChange(103);
  state.setPassengerQuantity(601, 1);
  state.clearActiveTripFlow();
  assert.equal(state.total, 0);
  assert.deepEqual(state.ticketItems, []);

  for (const trips of [[], [{ id: 985 }], [{ id: 985 }, { id: 986 }]]) {
    let sent;
    const flow = mountLogic(async request => { sent = request; return { success: true, data: { trips } }; });
    selectRoute(flow);
    await flow.loadActiveTrips();
    assert.equal(sent.endpoint, 'on-board-active-trips');
    assert.deepEqual(sent.data, { route_id: 17, branch_id: 7, vehicle_id: 12 });
    assert.equal(flow.step, trips.length > 1 ? 1 : 2);
    assert.equal(flow.saleTripId, trips.length === 1 ? 985 : null);
    if (trips.length > 1) {
      flow.selectActiveTrip(trips[1]);
      assert.equal(flow.step, 2);
      assert.equal(flow.saleTripId, 986);
    }
    flow.goBackFromSegmentStep();
    assert.equal(flow.step, 1);
    assert.equal(flow.selectedRouteId, 17);
    assert.deepEqual(flow.activeTrips.map(trip => trip.id), trips.map(trip => trip.id));
  }
  let resolveOld;
  const pending = mountLogic(() => new Promise(resolve => { resolveOld = resolve; }));
  selectRoute(pending);
  const request = pending.loadActiveTrips();
  pending.clearActiveTripFlow();
  resolveOld({ success: true, data: { trips: [{ id: 999 }] } });
  await request;
  assert.equal(pending.saleTripId, null, 'A stale context response must not restore a previous trip');
  assert.equal(pending.step, 1);

  assert.doesNotMatch(descriptor.template.content, /<span>(route_id|trip_id)<\/span>|Se creará al vender/);
  console.log('PASS: template/styles, passenger prices and quantities, totals, resets, 0/1/multiple trips, stale requests, summary.');
}

run().catch(error => { console.error(error); process.exitCode = 1; });
