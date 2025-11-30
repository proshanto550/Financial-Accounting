// Simple API tester to verify backend functionality
const axios = require('axios');

const API = axios.create({ baseURL: 'http://localhost:5000' });

async function testAPI() {
    try {
        console.log('1. Testing Register...');
        const registerRes = await API.post('/register', {
            name: 'Test User',
            email: 'test@test.com',
            password: 'password123'
        });
        console.log('✓ Register successful:', registerRes.data);

        console.log('\n2. Testing Login...');
        const loginRes = await API.post('/login', {
            email: 'test@test.com',
            password: 'password123'
        });
        console.log('✓ Login successful');
        const token = loginRes.data.token;
        console.log('Token:', token);

        const apiAuth = axios.create({
            baseURL: 'http://localhost:5000',
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('\n3. Testing GET /data...');
        const dataRes = await apiAuth.get('/data');
        console.log('✓ Got data:');
        console.log('Accounts count:', dataRes.data.accounts.length);
        console.log('Entries count:', dataRes.data.entries.length);
        console.log('First 3 accounts:', dataRes.data.accounts.slice(0, 3));

        console.log('\n4. Testing POST /accounts...');
        const accRes = await apiAuth.post('/accounts', {
            code: '9999',
            name: 'Test Account',
            type: 'asset'
        });
        console.log('✓ Created account:', accRes.data);

        console.log('\n5. Testing POST /entries...');
        const entryRes = await apiAuth.post('/entries', {
            date: '2025-11-29',
            description: 'Test Entry',
            is_adjusting: false,
            lines: [
                { accountId: dataRes.data.accounts[0].id, debit: 100, credit: 0 },
                { accountId: dataRes.data.accounts[1].id, debit: 0, credit: 100 }
            ]
        });
        console.log('✓ Created entry:', entryRes.data);

        console.log('\n6. Testing GET /data again...');
        const data2Res = await apiAuth.get('/data');
        console.log('✓ Got data again:');
        console.log('Accounts count:', data2Res.data.accounts.length);
        console.log('Entries count:', data2Res.data.entries.length);
        if (data2Res.data.entries.length > 0) {
            console.log('First entry:', data2Res.data.entries[0]);
        }

        console.log('\n✅ All tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testAPI();
