// Test Supabase Connection
const supabaseUrl = 'https://kkuekezteunxhgsbvxmx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdWVrZXp0ZXVueGhnc2J2eG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDQyOTAsImV4cCI6MjA4ODM4MDI5MH0.VtyJ0-jwgPN3zyeFj-qLrwJsR_PJsyQzn7qwt2xyOG4';

async function testConnection() {
    try {
        console.log('🔍 Testing Supabase Connection...');
        console.log('URL:', supabaseUrl);
        
        // Using fetch to test database connection
        const response = await fetch(`${supabaseUrl}/rest/v1/app_config?id=eq.1&select=*`, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        console.log('Response Status:', response.status);
        const data = await response.json();
        console.log('Response Data:', data);

        if (data && data.length > 0) {
            console.log('✅ DATABASE CONNECTION SUCCESSFUL!');
            console.log('Admin Password:', data[0].admin_pass);
            console.log('Rate 1:', data[0].rate1);
            console.log('Rate 2:', data[0].rate2);
            console.log('Rate 3:', data[0].rate3);
            console.log('BEP20:', data[0].bep20);
            console.log('TRC20:', data[0].trc20);
        } else {
            console.error('❌ NO DATA IN DATABASE - Table may be empty!');
        }

    } catch (error) {
        console.error('❌ CONNECTION ERROR:', error);
    }
}

testConnection();
