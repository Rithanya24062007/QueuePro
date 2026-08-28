const bcrypt = require('bcrypt');
const path = require('path');

// Load environment variables from backend .env
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const pool = require('./backend/config/database');

async function createAdmin() {
    try {
        // Get command line arguments
        const args = process.argv.slice(2);
        
        if (args.length < 3) {
            console.log('\nUsage: node create-admin.js <name> <email> <password>');
            console.log('Example: node create-admin.js "John Admin" admin@example.com securepass123\n');
            process.exit(1);
        }

        const name = args[0];
        const email = args[1];
        const password = args[2];

        console.log('\n=== Creating New Admin Account ===\n');

        // Check if email already exists
        console.log('Checking if email already exists...');
        const emailCheck = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (emailCheck.rows.length > 0) {
            console.error('✗ Error: Email already exists!');
            process.exit(1);
        }

        // Hash password
        console.log('Hashing password...');
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create admin user
        console.log('Creating admin user...');
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
            [name, email, passwordHash, 'admin']
        );

        const newAdmin = result.rows[0];
        console.log('\n✓ Admin account created successfully!\n');
        console.log('Admin Details:');
        console.log('  ID:', newAdmin.id);
        console.log('  Name:', newAdmin.name);
        console.log('  Email:', newAdmin.email);
        console.log('  Role:', newAdmin.role);
        console.log('  Created:', newAdmin.created_at);
        console.log('\nYou can now login with these credentials.\n');

        process.exit(0);

    } catch (error) {
        console.error('\n✗ Error creating admin:', error.message);
        process.exit(1);
    }
}

createAdmin();
