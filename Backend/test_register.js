const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

const form = new FormData();
form.append('name', 'test user');
form.append('email', 'test999@test.com');
form.append('mobile', '1234567890');
form.append('password', 'password');
form.append('designation', 'test dev');
form.append('companyId', '6997fbe1bca46f2c9d65fd88');
form.append('faceDescriptor', '[0]');

// Attach a dummy file
fs.writeFileSync('dummy.jpg', 'dummy image data');
form.append('image', fs.createReadStream('dummy.jpg'));

const req = http.request({
    host: 'localhost',
    port: 5001,
    path: '/api/auth/register',
    method: 'POST',
    headers: form.getHeaders()
}, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`BODY: ${data}`);
    });
});

req.on('error', e => console.error(e));
form.pipe(req);
