const http = require('http');
const app = require('./server');

// Helper to make HTTP requests
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000${path}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const data = body ? JSON.stringify(body) : null;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);

    const req = http.request(
      url,
      { method, headers },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch (e) {
            parsed = raw;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

async function runTests() {
  console.log('====================================================');
  console.log('BUDGETBITE FULL-STACK COMPREHENSIVE INTEGRATION TEST');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'online', '1. Server Health Check online');

    // 2. Initial Sample Customer Login
    const custLogin = await request('POST', '/api/auth/login', {
      email: 'customer@budgetbite.com',
      password: 'Customer@123'
    });
    assert(custLogin.status === 200 && custLogin.body.token, '2. Customer Login successful');
    const customerToken = custLogin.body.token;

    // 3. Initial Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@budgetbite.com',
      password: 'Admin@123'
    });
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'admin', '3. Admin Login & Role Verification');
    const adminToken = adminLogin.body.token;

    // 4. Registration of a new customer
    const randEmail = `diner_${Date.now()}@budgetbite.com`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Rohan Mehra',
      email: randEmail,
      phone: '9876598765',
      password: 'RohanPassword@123'
    });
    assert(regRes.status === 201 && regRes.body.token, '4. Customer Registration endpoint');

    // 5. Food Menu retrieval (All 16 initial items from MySQL)
    const foodsRes = await request('GET', '/api/foods');
    assert(foodsRes.status === 200 && foodsRes.body.foods.length >= 16, `5. Food Menu loaded from MySQL (${foodsRes.body.foods.length} items)`);

    // 6. Food Search
    const searchRes = await request('GET', '/api/foods?search=Fried Rice');
    assert(searchRes.status === 200 && searchRes.body.foods.length >= 3, '6. Food Search for "Fried Rice" works');

    // 7. Category Filter (Rice)
    const catRes = await request('GET', '/api/foods?category=rice');
    assert(catRes.status === 200 && catRes.body.foods.every((f) => f.category_slug === 'rice'), '7. Category Filter (Rice) works');

    // 8. Veg Filter
    const vegRes = await request('GET', '/api/foods?is_veg=1');
    assert(vegRes.status === 200 && vegRes.body.foods.every((f) => f.is_veg === 1), '8. Vegetarian Filter works');

    // 9. Combos retrieval (3 Initial Combos with included foods & savings)
    const combosRes = await request('GET', '/api/combos');
    assert(combosRes.status === 200 && combosRes.body.combos.length >= 3, '9. Combos retrieved with item breakdowns & savings');

    // 10. Crave Match Filter (Spicy)
    const craveRes = await request('GET', '/api/foods?tag=spicy');
    assert(craveRes.status === 200 && craveRes.body.foods.length > 0, `10. Crave Match tag query works (${craveRes.body.foods.length} spicy dishes found)`);

    // 11. Guest ordering rejection (Requirement: mandatory customer login before ordering)
    const guestOrderRes = await request('POST', '/api/orders', {
      customer_name: 'Guest User',
      customer_email: 'guest@example.com',
      customer_phone: '9999999999',
      delivery_address: 'Guest street',
      items: [{ id: 3, type: 'food', quantity: 1 }]
    });
    assert(guestOrderRes.status === 401, '11. Guest order placement correctly rejected with 401 (Authentication required)');

    // 12. Transactional Order Placement with Backend Price Verification
    // Ordering Chicken Fried Rice (₹130) + French Fries (₹50) = ₹180 + ₹30 delivery = ₹210
    const orderRes = await request(
      'POST',
      '/api/orders',
      {
        customer_name: 'Aditi Sharma',
        customer_email: 'customer@budgetbite.com',
        customer_phone: '9812345678',
        delivery_address: 'Flat 302, Green Glen Apartments, Bellandur, Bengaluru',
        delivery_instructions: 'Ring bell and hand over',
        payment_method: 'Cash on Delivery',
        items: [
          { id: 3, type: 'food', quantity: 1 }, // Chicken Fried Rice (₹130)
          { id: 11, type: 'food', quantity: 1 } // French Fries (₹50)
        ]
      },
      customerToken
    );

    assert(orderRes.status === 201 && orderRes.body.order.order_number, '12. Transactional Order Creation with Customer Token');
    assert(parseFloat(orderRes.body.order.total_amount) === 210, `13. Backend Price Validation accurate: Grand Total is ₹${orderRes.body.order.total_amount}`);

    const newOrderNumber = orderRes.body.order.order_number;
    const newOrderId = orderRes.body.order.id;

    // 14. Order Tracking by Order Number (Authenticated with Owner's Token)
    const trackRes = await request('GET', `/api/orders/${newOrderNumber}`, null, customerToken);
    assert(trackRes.status === 200 && trackRes.body.order.order_status === 'Order Placed', '14. Live Order Tracking by BB-OrderNumber with owner token');

    // 15. Cross-Customer Order Tracking Security Check (User 2's token vs User 1's order)
    const rohanLogin = await request('POST', '/api/auth/login', {
      email: randEmail,
      password: 'RohanPassword@123'
    });
    const rohanToken = rohanLogin.body.token;
    const unauthorizedTrack = await request('GET', `/api/orders/${newOrderNumber}`, null, rohanToken);
    assert(unauthorizedTrack.status === 403, '15. Customer cross-access prevention: Customer A cannot view Customer B\'s order (403 Forbidden)');

    // 14. Customer Personal Order History
    const myOrdersRes = await request('GET', '/api/orders/my', null, customerToken);
    assert(myOrdersRes.status === 200 && myOrdersRes.body.orders.some((o) => o.order_number === newOrderNumber), '14. Customer My Orders history includes new order');

    // 15. Admin Updating Order Status Pipeline
    const prepRes = await request('PATCH', `/api/orders/${newOrderId}/status`, { status: 'Preparing Food' }, adminToken);
    assert(prepRes.status === 200, '15. Admin updates status to "Preparing Food"');

    const outRes = await request('PATCH', `/api/orders/${newOrderId}/status`, { status: 'Out for Delivery' }, adminToken);
    assert(outRes.status === 200, '16. Admin updates status to "Out for Delivery"');

    const delivRes = await request('PATCH', `/api/orders/${newOrderId}/status`, { status: 'Delivered' }, adminToken);
    assert(delivRes.status === 200, '17. Admin updates status to "Delivered"');

    // 16. Verify tracking page reflects "Delivered"
    const trackDeliv = await request('GET', `/api/orders/${newOrderNumber}`);
    assert(trackDeliv.body.order.order_status === 'Delivered', '18. Customer Tracking reflects updated "Delivered" status');

    // 17. Customer submitting Review for Delivered Order
    const revRes = await request(
      'POST',
      '/api/reviews',
      {
        order_id: newOrderId,
        food_id: 3,
        rating: 5,
        comment: 'Fresh, piping hot, and full of flavor. Arrived ahead of time!'
      },
      customerToken
    );
    assert(revRes.status === 201, '19. Customer review submitted on eligible delivered order');

    // 18. Duplicate Review Prevention
    const dupRevRes = await request(
      'POST',
      '/api/reviews',
      {
        order_id: newOrderId,
        food_id: 3,
        rating: 4,
        comment: 'Trying to review again'
      },
      customerToken
    );
    assert(dupRevRes.status === 409, '20. Duplicate review correctly prevented (409 Conflict)');

    // 19. Admin Dashboard Metrics
    const dashRes = await request('GET', '/api/admin/dashboard', null, adminToken);
    assert(dashRes.status === 200 && dashRes.body.stats.total_orders > 0, '21. Admin Dashboard KPI Statistics');

    // 20. Admin Reports
    const repRes = await request('GET', '/api/admin/reports', null, adminToken);
    assert(repRes.status === 200 && repRes.body.reports.popular_foods.length > 0, '22. Admin Reports & Best Selling Foods');

    // 21. Admin Food Management (Add, Update, Delete)
    const addFoodRes = await request(
      'POST',
      '/api/foods',
      {
        name: 'Crispy Corn Pepper Fry',
        category_id: 3,
        price: 95,
        description: 'Tender sweet corn tossed with freshly cracked black pepper and green onions.',
        is_veg: 1,
        is_available: 1,
        tags: 'crunchy,spicy'
      },
      adminToken
    );
    assert(addFoodRes.status === 201 && addFoodRes.body.food.id, '23. Admin adds new food dish');
    const createdFoodId = addFoodRes.body.food.id;

    // Toggle availability
    const toggleRes = await request('PUT', `/api/foods/${createdFoodId}`, { is_available: 0 }, adminToken);
    assert(toggleRes.status === 200 && toggleRes.body.food.is_available === 0, '24. Admin toggles food availability to Sold Out');

    // Delete test dish
    const delFoodRes = await request('DELETE', `/api/foods/${createdFoodId}`, null, adminToken);
    assert(delFoodRes.status === 200, '25. Admin deletes test food dish');

    // 22. Profile Addresses Management
    const addAddrRes = await request(
      'POST',
      '/api/profile/address',
      {
        address_line: 'Tower 4, 12th Floor, Prestige Tech Park',
        city: 'Bengaluru',
        postal_code: '560103',
        is_default: 0
      },
      customerToken
    );
    assert(addAddrRes.status === 201, '26. Customer adds and saves new address in profile');

    console.log('\n====================================================');
    console.log(`TOTAL TESTS RUN: ${passed + failed}`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);
    console.log('====================================================');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

// Wait for server to be up before starting test suite
setTimeout(runTests, 1000);
