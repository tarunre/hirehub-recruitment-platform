const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const crypto = require('crypto');
const { log } = require('console');
const cron = require('node-cron');
const { ObjectId } = require('mongodb');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

// const jwt = require('jsonwebtoken');



const app = express();
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
const mongoUri = 'mongodb+srv://harsha:Harsha239874@cluster0.8vbog8c.mongodb.net/UserDB?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoUri, {
    // `useNewUrlParser: true,
    // useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

const db = mongoose.connection;

const JWT_SECRET = 'hire_hub_9';


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'chinnuchakka6@gmail.com',
        pass: 'charitha@06'
    }
});

app.use(session({
    secret: 'your-secret-key', // Replace with a strong secret
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: mongoUri  }), // Update with your MongoDB connection string
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));


app.use(flash());

app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

//home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Signup route with OTP verification
app.post('/signup', async (req, res) => {
    const { email, name, roll, password } = req.body;

    try {
        // Generate OTP
        const otp = generateOTP();

        // Update or insert OTP document in MongoDB
        const otpsCollection = db.collection('otps');
        await otpsCollection.updateOne(
            { email: email },
            { $set: { otp: otp, createdAt: new Date() } },
            { upsert: true }
        );
        // Send OTP via email
        const info = await sendOTPEmail(email, otp);
        console.log('Email sent: ' + info.response);
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        res.status(500).json({ success: false, message: 'Error sending OTP' });
    }
});


// Login route
app.post('/login1', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const studentsCollection = db.collection('students');
        const user = await studentsCollection.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare the entered password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Authentication successful
        // const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '3h' });
        req.session.userId = user._id;
        req.session.email = user.email;
        res.status(200).json({ message: 'Login successful', id: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out', error: err });
        }
        res.clearCookie('connect.sid'); // This clears the session cookie
        res.status(200).json({ message: 'Logout successful' });
    });
});
app.get('/check-session', (req, res) => {
    if (req.session.userId) {
        res.status(200).json({ message: 'Session active', id: req.session.userId });
    } else {
        res.status(401).json({ message: 'Session inactive' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.redirect('/home');
    });
});

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        // User is authenticated
        return next();
    } else {
        // User is not authenticated, redirect with query parameter
        res.redirect('/login1?alert=login');
    }
}

function isRecAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/rlogin?alert=login');
    }
}

function isVerAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/cologin?alert=login');
    }
}

// Route to serve the signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login1', (req, res) => {
    if (req.session.userId) {
        // If the user is already logged in, redirect to the rechome page
        return res.redirect(`/stuhome?id=${req.session.userId}`);
    }
    res.sendFile(path.join(__dirname, 'public', 'login1.html'));
});

app.get('/rsignup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'rsignup.html'))
})

app.get('/rlogin', (req, res) => {
    if (req.session.userId) {
        // If the user is already logged in, redirect to the rechome page
        return res.redirect(`/rechome?id=${req.session.userId}`);
    }
        res.sendFile(path.join(__dirname,'public', 'rlogin.html'));
    
})

app.get('/cologin', (req, res) => {
    if (req.session.userId) {
        // If the user is already logged in, redirect to the rechome page
        return res.redirect(`/verifierhome?id=${req.session.userId}`);
    }
    res.sendFile(path.join(__dirname, 'public', 'cologin.html'))
})

const rsignupUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    company: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const RsignupUser = mongoose.model('RsignupUser', rsignupUserSchema);


app.post('/rsignup', async (req, res) => {
    const { email, name, company, mobile, password } = req.body;

    try {
        // Check if the user already exists with the same email or mobile number
        const otp = generateOTP();

        // Update or insert OTP document in MongoDB
        const otpsCollection = db.collection('otps');
        await otpsCollection.updateOne(
            { email: email },
            { $set: { otp: otp, createdAt: new Date() } },
            { upsert: true }
        );
        // Send OTP via email
        const info = await sendOTPEmail(email, otp);
        console.log('Email sent: ' + info.response);
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        res.status(500).json({ success: false, message: 'Error sending OTP' });
    }
});

app.post('/rsignup-verify-otp', async (req, res) => {
    const { email, otp, name, company, mobile, password } = req.body;

    try {
        const otpsCollection = db.collection('otps');
        const recruitersCollection = db.collection('recruiters')
        // Find the OTP document for the given email
        const result = await otpsCollection.findOne({ email: email });

        if (!result) {
            return res.status(400).json({ success: false, message: 'Email not found' });
        }

        // Compare the provided OTP with the stored OTP
        if (result.otp.trim() === otp.trim()) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newRecruiter = {
                email: email,
                name: name,
                company: company,
                mobile: mobile,
                password: hashedPassword,
            };

            await recruitersCollection.insertOne(newRecruiter);
            res.status(200).json({ success: true, message: 'OTP verified', email: email });

        } else {
            res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (err) {
        console.log('Database error: ', err.message);
        res.status(500).json({ success: false, message: 'Error verifying OTP' });
    }
})


app.post('/rlogin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const recruitersCollection = db.collection('recruiters')
        const user = await recruitersCollection.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare the entered password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        // Authentication successful
        req.session.userId = user._id;
        req.session.email = user.email;
        res.status(200).json({ message: 'Login successful', id: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out', error: err });
        }
        res.clearCookie('connect.sid'); // This clears the session cookie
        res.status(200).json({ message: 'Logout successful' });
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.redirect('/home');
    });
});




app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML files
app.get('/forgot_password', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'forgotpw.html'));
});

app.get('/reset-password', (req, res) => {
    // const email = req.query.email;
    res.sendFile(path.join(__dirname, 'public', 'changepw.html'));
});



app.get('/stuProfile',isAuthenticated, (req, res) => {
    // const email = req.query.email;
    res.sendFile(path.join(__dirname, 'public', 'stuProfile.html'));
});

app.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    try {
        // Generate OTP
        const otp = generateOTP();

        // Update or insert OTP document in MongoDB
        const otpsCollection = db.collection('otps');
        await otpsCollection.updateOne(
            { email: email },
            { $set: { otp: otp, createdAt: new Date() } },
            { upsert: true }
        );

        // Send OTP via email
        const info = await sendOTPEmail(email, otp);
        console.log('Email sent: ' + info.response);
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        res.status(500).json({ success: false, message: 'Error sending OTP' });
    }
});
// Function to generate a 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP via email
async function sendOTPEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'bcs_2022016@iiitm.ac.in',
            pass: 'abcd1234'
        }
    });

    const mailOptions = {
        from: 'bcs_2022016@iiitm.ac.in',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };

    return await transporter.sendMail(mailOptions);
}

app.post('/signup-verify-otp', async (req, res) => {
    const { email, otp, name, roll, password } = req.body;

    try {
        const otpsCollection = db.collection('otps');
        const studentsCollection = db.collection('students')
        // Find the OTP document for the given email
        const result = await otpsCollection.findOne({ email: email });

        if (!result) {
            return res.status(400).json({ success: false, message: 'Email not found' });
        }

        // Compare the provided OTP with the stored OTP
        if (result.otp.trim() === otp.trim()) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newStudent = {
                email: email,
                name: name,
                rollNumber: roll,
                password: hashedPassword,
            };

            await studentsCollection.insertOne(newStudent);
            res.status(200).json({ success: true, message: 'OTP verified', email: email });

        } else {
            res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (err) {
        console.log('Database error: ', err.message);
        res.status(500).json({ success: false, message: 'Error verifying OTP' });
    }
})

app.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpsCollection = db.collection('otps');
        // Find the OTP document for the given email
        const result = await otpsCollection.findOne({ email: email });

        if (!result) {
            return res.status(400).json({ success: false, message: 'Email not found' });
        }

        // Compare the provided OTP with the stored OTP
        if (result.otp.trim() === otp.trim()) {
            res.status(200).json({ success: true, message: 'OTP verified', email: email });
        } else {
            res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (err) {
        console.log('Database error: ', err.message);
        res.status(500).json({ success: false, message: 'Error verifying OTP' });
    }
});


app.post('/change-password', async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    try {
        // Find the user by email
        const studentsCollection = db.collection('students');
        const user = await studentsCollection.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if newPassword and confirmPassword match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        await studentsCollection.updateOne(
            { email: email },
            { $set: { password: hashedPassword } }
        );

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error.message);
        res.status(500).json({ message: 'Error changing password' });
    }
});

app.post('/cologin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const verifierCollection = db.collection('coordinator')
        const user = await verifierCollection.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Compare the entered password with the hashed password
        // const isMatch = await bcrypt.compare(password, user.password);
        if (password !== user.password) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // if (!isMatch) {
        //     return res.status(400).json({ message: 'Invalid email or password' });
        // }
        // Authentication successful
        req.session.userId = user._id;
        req.session.email = user.email;
        res.status(200).json({ message: 'Login successful', id: user._id });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});



app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out', error: err });
        }
        res.clearCookie('connect.sid'); // This clears the session cookie
        res.status(200).json({ message: 'Logout successful' });
    });
});


app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.redirect('/home');
    });
});

cron.schedule('* * * * *', async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await otpsCollection.deleteMany({ createdAt: { $lt: oneMinuteAgo } });
    console.log('Old OTPs deleted');
});

app.get('/createdrive',isRecAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'createdrive.html'));
});

const drivesCollection = db.collection('drives');

app.post('/create-drive', async (req, res) => {
    const formData = req.body; // Assuming all form data is sent in the request body

    try {
        // Insert form data into MongoDB
        const result = await drivesCollection.insertOne(formData);
        console.log('Drive data inserted:', result.insertedId);
        res.status(200).json({ message: 'Drive data inserted successfully' });
    } catch (error) {
        console.error('Error inserting drive data:', error);
        res.status(500).json({ message: 'Error inserting drive data' });
    }
});
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});
app.get('/check-session', (req, res) => {
    if (req.session.userId) {
        res.status(200).json({ message: 'Session active', id: req.session.userId });
    } else {
        res.status(401).json({ message: 'Session inactive' });
    }
});

cron.schedule('0 0 * * *', async () => { 
    try {
        const now = new Date();
        const cutoffDate = new Date(now.setDate(now.getDate())); // 30 days ago

        const drivesCollection = db.collection('drives');
        
        await drivesCollection.deleteMany({ dateOfDrive: { $lt: cutoffDate } });
        
        console.log('Old drives deleted successfully');
    } catch (error) {
        console.error('Error deleting old drives:', error);
    }
});


app.get('/rechome',isRecAuthenticated, (req, res) => {

    res.sendFile(path.join(__dirname, 'public', 'rechome.html'));
});

app.get('/recforgotpw', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'recforgotpw.html'));
});

app.post('/rec-forgot-verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const otpsCollection = db.collection('otps');
        // Find the OTP document for the given email
        const result = await otpsCollection.findOne({ email: email });

        if (!result) {
            return res.status(400).json({ success: false, message: 'Email not found' });
        }

        // Compare the provided OTP with the stored OTP
        if (result.otp.trim() === otp.trim()) {
            res.status(200).json({ success: true, message: 'OTP verified', email: email });
        } else {
            res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
    } catch (err) {
        console.log('Database error: ', err.message);
        res.status(500).json({ success: false, message: 'Error verifying OTP' });
    }
});

app.get('/recchangepw', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'recchangepw.html'));
});

app.post('/rec-change-password', async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    try {
        // Find the user by email
        const recruitersCollection = db.collection('recruiters')
        const user = await recruitersCollection.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if newPassword and confirmPassword match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        await recruitersCollection.updateOne(
            { email: email },
            { $set: { password: hashedPassword } }
        );

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error.message);
        res.status(500).json({ message: 'Error changing password' });
    }
});

app.get('/drivedetails',isRecAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'drivedetails.html'));
});

app.get('/verifierhome',isVerAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verifierHome.html'));
});

app.get('/verifierDrive',isVerAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verifierDrive.html'));
});
app.get('/verifierCreate',isVerAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'verifierCreate.html'));
});
app.get('/stuDrive',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stuDrive.html'));
});

app.get('/reccordrives', async (req, res) => {

    try {
        const drivesCollection = db.collection('drives');
        const drives = await drivesCollection.find({}).toArray();
        const verifierDriveCollection = db.collection('verifierDrives')
        const verifierDrives = await verifierDriveCollection.find({}).toArray();

        const combined_drives = [...drives, ...verifierDrives].sort((a, b) => {
            const dateA = new Date(a.dateOfDrive);
            const dateB = new Date(b.dateOfDrive);
            return dateA - dateB;
        });
        res.json(combined_drives);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/recdrivesList/:id', async (req, res) => {
    const recId = req.params.id;
    try {
        const drivesCollection = db.collection('drives');
        const recruitersCollection = db.collection('recruiters');
        const verifierDriveCollection = db.collection('verifierDrives');

        // Find recruiter by ID
        const recruiter = await recruitersCollection.findOne({ _id: new ObjectId(recId) });

        if (!recruiter) {
            return res.status(404).json({ error: 'Recruiter not found' });
        }

        // Get recruiter's email
        const email = recruiter.email;

        // Fetch drives and verifier drives
        const drives = await drivesCollection.find({ recid: recId }).sort({ dateOfDrive: 1 }).toArray();
        const verifierDrives = await verifierDriveCollection.find({ email: email }).sort({ dateOfDrive: 1 }).toArray();

        // Combine and sort drives by dateOfDrive
        const combined_drives = [...drives, ...verifierDrives].sort((a, b) => {
            const dateA = new Date(a.dateOfDrive);
            const dateB = new Date(b.dateOfDrive);
            return dateA - dateB;
        });

        res.json(combined_drives);
    } catch (error) {
        console.error('Error fetching drives:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});




app.get('/reccordrives/:id', async (req, res) => {
    const driveId = req.params.id;
    try {
        if (!ObjectId.isValid(driveId)) {
            return res.status(400).send('Invalid drive ID');
        }

        const drivesCollection = db.collection('drives');
        const recruitersCollection = db.collection('recruiters');
        const verifierDriveCollection = db.collection('verifierDrives');

        let drive = await drivesCollection.findOne({ _id: new ObjectId(driveId) });
        if (!drive) {
            drive = await verifierDriveCollection.findOne({ _id: new ObjectId(driveId) });
        }

        if (!drive) {
            return res.status(404).send('Drive not found');
        }

        let user = await recruitersCollection.findOne({ _id: new ObjectId(drive.recid) });
        if (!user) {
            user = await recruitersCollection.findOne({ email: drive.email });
        }

        res.json({ drive, user });
    } catch (error) {
        console.error('Error fetching drive details:', error);
        res.status(500).send('Error fetching drive details');
    }
});


app.put('/reccordrives/:id/status', async (req, res) => {
    const driveId = req.params.id;
    const { status } = req.body;

    try {
        if (!ObjectId.isValid(driveId)) {
            return res.status(400).send('Invalid drive ID');
        }

        let update = {};
        if (status === 'accepted') {
            update = { isAccepted: true, isRejected: false };
        } else if (status === 'rejected') {
            update = { isRejected: true, isAccepted: false };
        } else {
            return res.status(400).send('Invalid status');
        }

        const drivesCollection = db.collection('drives');
        const result = await drivesCollection.updateOne(
            { _id: new ObjectId(driveId) },
            { $set: update }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send('Drive not found');
        }

        res.send('Drive status updated');
    } catch (error) {
        res.status(500).send('Error updating drive status');
    }
});


app.get('/recdrives', async (req, res) => {
    try {
        const drivesCollection = db.collection('drives');
        const verifierDriveCollection = db.collection('verifierDrives');

        // Fetch only the accepted drives
        const drives = await drivesCollection.find({ isAccepted: true }).toArray();
        const verifierDrives = await verifierDriveCollection.find({ isAccepted: true }).toArray();

        const combined_drives = [...drives, ...verifierDrives].sort((a, b) => {
            const dateA = new Date(a.dateOfDrive);
            const dateB = new Date(b.dateOfDrive);
            return dateA - dateB;
        });

        res.json(combined_drives);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Fetch details for a specific drive
app.get('/recdrives/:id', async (req, res) => {
    const driveId = req.params.id;
    try {
        if (!ObjectId.isValid(driveId)) {
            return res.status(400).send('Invalid drive ID');
        }

        const drivesCollection = db.collection('drives');
        const recruitersCollection = db.collection('recruiters');
        const verifierDriveCollection = db.collection('verifierDrives');

        let drive = await drivesCollection.findOne({ _id: new ObjectId(driveId) });
        if (!drive) {
            drive = await verifierDriveCollection.findOne({ _id: new ObjectId(driveId) });
        }

        if (!drive) {
            return res.status(404).send('Drive not found');
        }

        let user = await recruitersCollection.findOne({ _id: new ObjectId(drive.recid) });
        if (!user) {
            user = await recruitersCollection.findOne({ email: drive.email });
        }

        res.json({ drive, user });
    } catch (error) {
        console.error('Error fetching drive details:', error);
        res.status(500).send('Error fetching drive details');
    }
});

// Update the status of a drive
app.put('/recdrives/:id/status', async (req, res) => {
    const driveId = req.params.id;
    const { status } = req.body;

    try {
        if (!ObjectId.isValid(driveId)) {
            return res.status(400).send('Invalid drive ID');
        }

        let update = {};
        if (status === 'accepted') {
            update = { isAccepted: true, isRejected: false };
        } else if (status === 'rejected') {
            update = { isRejected: true, isAccepted: false };
        } else {
            return res.status(400).send('Invalid status');
        }

        const drivesCollection = db.collection('drives');
        const result = await drivesCollection.updateOne(
            { _id: new ObjectId(driveId) },
            { $set: update }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send('Drive not found');
        }

        res.send('Drive status updated');
    } catch (error) {
        console.error('Error updating drive status:', error);
        res.status(500).send('Error updating drive status');
    }
});

app.get('/notifiedDrives/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const notifiedDrivesCollection = db.collection('notifiedDrives');
        const userDoc = await notifiedDrivesCollection.findOne({ userId });

        if (userDoc) {
            res.json(userDoc.notifiedDrives);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching notified drives:', error);
        res.status(500).send('Error fetching notified drives');
    }
});

app.post('/notifiedDrives/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { newDrives } = req.body;

    try {
        const notifiedDrivesCollection = db.collection('notifiedDrives');

        await notifiedDrivesCollection.updateOne(
            { userId },
            { $addToSet: { notifiedDrives: { $each: newDrives } } },
            { upsert: true }
        );

        res.send('Notified drives updated');
    } catch (error) {
        console.error('Error updating notified drives:', error);
        res.status(500).send('Error updating notified drives');
    }
});

app.post('/create-verifier-drive', async (req, res) => {
    const formData = req.body; // Assuming all form data is sent in the request body

    try {
        // Insert form data into MongoDB
        const verifierDriveCollection = db.collection('verifierDrives');
        const result = await verifierDriveCollection.insertOne(formData);
        console.log('Drive data inserted:', result.insertedId);
        res.status(200).json({ message: 'Drive data inserted successfully' });
    } catch (error) {
        console.error('Error inserting drive data:', error);
        res.status(500).json({ message: 'Error inserting drive data' });
    }
});

//profile pic

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Serve static files (if needed)
app.use(express.static('public'));

// Route for saving profile changes
app.post('/api/saveProfile', upload.single('profilePicture'), (req, res) => {
    // Handle form data here
    const name = req.body.name;
    const college = req.body.college;
    const profilePicture = req.file ? req.file.filename : 'default-profile.png'; // Adjust as needed

    // Here you would typically save this data to your database
    // For demonstration purposes, just sending back the received data
    res.json({ message: 'Profile updated successfully', data: { name, college, profilePicture } });
});




app.get('/stuhome',isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stuhome.html'));
});


const profileSchema = new mongoose.Schema({}, { strict: false });
const Profile = mongoose.model('Profile', profileSchema);

app.post('/update-stu-profile', upload.single('profilePicture'), async (req, res) => {
    const profileData = req.body;
    if (req.file) {
        profileData.profilePicture = req.file.filename;
    }

    try {
        const updatedProfile = await Profile.findOneAndUpdate(
            { email: profileData.email },
            profileData,
            { new: true, upsert: true }
        );
        res.status(200).json(updatedProfile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'An error occurred while updating the profile' });
    }
});


app.get('/studrives', async (req, res) => {
    const stuId = req.query.sid;
    const driveId = req.query.id;

    try {
        if (!ObjectId.isValid(stuId)) {
            return res.status(400).send('Invalid drive ID');
        }

        const drivesCollection = db.collection('drives');
        // const studentsCollection = db.collection('students');
        const verifierDriveCollection = db.collection('verifierDrives');
        const consentCollection = db.collection('consents');

        let user = await consentCollection.findOne({ studentId: stuId, driveId: driveId });

        let drive = await drivesCollection.findOne({ _id: new ObjectId(driveId) });
        if (!drive) {
            drive = await verifierDriveCollection.findOne({ _id: new ObjectId(driveId) });
        }

        if (!drive) {
            return res.status(404).send('Drive not found');
        }

        res.json({ drive, user });
    } catch (error) {
        console.error('Error fetching drive details:', error);
        res.status(500).send('Error fetching drive details');
    }
});

app.get('/studrivesList', async (req, res) => {
    const stuId = req.query.id; // Extracting student ID from query parameters
    try {
        const drivesCollection = db.collection('drives');
        const consentCollection = db.collection('consents');
        const verifierDriveCollection = db.collection('verifierDrives')

        // Find consents by student ID
        const studrives = await consentCollection.find({ studentId: stuId }).toArray();

        if (!studrives.length) {
            return res.status(404).json({ error: 'No drives found for the given student ID' });
        }

        // Extract drive IDs from consents
        const driveIds = studrives.map(studrive => new ObjectId(studrive.driveId));
        console.log(driveIds);

        const drives = await drivesCollection.find({ _id: { $in: driveIds } }).sort({ dateOfDrive: 1 }).toArray();
        const verifierDrives = await verifierDriveCollection.find({ _id: { $in: driveIds } }).sort({ dateOfDrive: 1 }).toArray();

        // Combine and sort drives by dateOfDrive
        const combined_drives = [...drives, ...verifierDrives].sort((a, b) => {
            const dateA = new Date(a.dateOfDrive);
            const dateB = new Date(b.dateOfDrive);
            return dateA - dateB;
        });
        res.json(combined_drives);
    } catch (error) {
        console.error('Error fetching drives:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/stuProfileDetails', async (req, res) => {
    const stuId = req.query.id;
    try {
        // console.log(stuId);
        if (!ObjectId.isValid(stuId)) {
            return res.status(400).json({ error: 'Invalid profile ID' });
        }

        const profilesCollection = db.collection('profiles');

        let profile = await profilesCollection.findOne({ studentId: stuId });

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // console.log(profile);

        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile details:', error);
        res.status(500).json({ error: 'Error fetching profile details' });
    }
});


app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/stuAppliedJobs',isAuthenticated, async (rew, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stuAppliedJobs.html'));
})
app.get('/homestu',isAuthenticated, async (rew, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homestu.html'));
})
app.get('/homerec',isRecAuthenticated, async (rew, res) => {
    res.sendFile(path.join(__dirname, 'public', 'homerec.html'));
})

app.get('/stuConsentForm',isAuthenticated, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'stuConsentForm.html'));
})


app.post('/consent-details', async (req, res) => {
    const formData = req.body; // Assuming all form data is sent in the request body

    try {
        const consentCollection = db.collection('consents');

        // Insert form data into MongoDB
        const result = await consentCollection.insertOne(formData);

        res.status(200).json({ message: 'Drive data inserted successfully' });
    } catch (error) {
        console.error('Error inserting drive data:', error);
        res.status(500).json({ message: 'Error inserting drive data' });
    }
});


app.post('/save-round-details', async (req, res) => {
    const { driveId, roundId, title, date, text, selectedStudents,resultsDeclared } = req.body;
    try {
        const roundsCollection = db.collection('rounds');
        const round = await roundsCollection.findOneAndUpdate(
            { driveId: driveId, roundId: roundId },
            { $set: { title, date, text, selectedStudents,resultsDeclared } },
            { returnOriginal: false, upsert: true }
        );

        res.status(200).json({ message: 'Round details saved', round: roundId });
    } catch (error) {
        console.error('Error saving round details:', error);
        res.status(500).json({ message: 'Error saving round details' });
    }
});
app.post('/update-round-selected-students', async (req, res) => {
    const { driveId, roundId, studentId, isChecked } = req.body;

    try {

        console.log(roundId);
        console.log(driveId);
        console.log(studentId, isChecked);
        // console.log()
        const roundsCollection = db.collection('rounds');

        // Find the round document using driveId and roundId
        let round = await roundsCollection.findOne({ driveId: driveId, roundId: parseInt(roundId) });

        // If round document does not exist, handle appropriately
        if (!round) {
            return res.status(404).json({ message: 'Round not found' });
        }

        // Update selectedStudents array based on isChecked
        if (isChecked) {
            // Add studentId to selectedStudents if not already present
            if (!round.selectedStudents.includes(studentId)) {
                round.selectedStudents.push(studentId);
            }
        } else {
            // Remove studentId from selectedStudents
            round.selectedStudents = round.selectedStudents.filter(id => id !== studentId);
        }

        // Update the round document with the modified selectedStudents array
        const filter = { _id: round._id }; // Use _id to update the existing document
        const update = {
            $set: { selectedStudents: round.selectedStudents } // Update the selectedStudents field
        };

        const options = { returnOriginal: false }; // Ensure returnOriginal is false for updated document

        // Perform the update operation
        round = await roundsCollection.findOneAndUpdate(filter, update, options);

        res.status(200).json({ message: 'Selected students updated successfully', round: round.value });
    } catch (error) {
        console.error('Error updating selected students for round:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/get-round-selected-students/:driveId/:roundId', async (req, res) => {
    const { driveId, roundId } = req.params;

    try {
        const roundsCollection = db.collection('rounds');
        const round = await roundsCollection.findOne({ driveId: driveId, roundId: parseInt(roundId) });

        if (!round) {
            return res.status(404).json({ message: 'Round not found' });
        }

        // Return selectedStudents array for the round
        res.status(200).json(round.selectedStudents || []);
    } catch (error) {
        console.error('Error fetching selected students for round:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/get-rounds/:driveId', async (req, res) => {
    const driveId = req.params.driveId;
    try {
        const roundsCollection = db.collection('rounds');
        const rounds = await roundsCollection.find({ driveId: driveId }).sort({ roundId: 1 }).toArray();
        res.json(rounds);
    } catch (error) {
        console.error('Error fetching rounds from database:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/appliedStudents/:driveId', async (req, res) => {
    const driveId = req.params.driveId;

    try {
        const consentCollection = db.collection('consents');
        const appliedStudents = await consentCollection.find({ driveId: driveId }).toArray();

        if (appliedStudents.length === 0) {
            return res.status(200).json(appliedStudents);
        }

        res.status(200).json(appliedStudents);
    } catch (error) {
        console.error('Error fetching applied students:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/updateCheckedStatus/:studentId', async (req, res) => {
    const studentId = req.params.studentId;
    const { checked } = req.body;

    try {
        const consentCollection = db.collection('consents');
        const result = await consentCollection.updateOne(
            { _id: new ObjectId(studentId) },
            { $set: { checked: checked } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Checked status updated successfully' });
    } catch (error) {
        console.error('Error updating checked status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/shortlistedStudents/:driveId', async (req, res) => {
    const driveId = req.params.driveId;
    try {
        console.log(driveId); // Logging driveId for debugging

        const consentCollection = db.collection('consents');
        const shortlistedStudents = await consentCollection.find({ driveId: driveId, checked: true }).toArray();
        console.log(shortlistedStudents); // Logging fetched shortlistedStudents for debugging

        res.status(200).json(shortlistedStudents); // Sending shortlistedStudents as JSON response
    } catch (error) {
        console.error('Error fetching shortlisted students:', error);
        res.status(500).json({ message: 'Internal server error' }); // Handling error with 500 status and generic message
    }
});


app.get('/get-latest-round/:driveId', async (req, res) => {
    try {
        const { driveId } = req.params;
        console.log(driveId);
        const roundsCollection = db.collection('rounds');
        const latestRound = await roundsCollection.findOne(
            { driveId: driveId },
            { sort: { roundId: -1 }, limit: 1 }
        );
        if (!latestRound) {
            return res.status(404).json({ message: 'No rounds found for this drive' });
        }
        res.json(latestRound);
    } catch (error) {
        console.error('Error fetching latest round:', error);
        res.status(500).send('Server Error');
    }
});



// app.post('/send-final-result-emails', async (req, res) => {
//     const { driveId, selectedStudents } = req.body;
//     try {
//         const consentCollection = db.collection('consents');

//         // Fetch email addresses of selected students
//         const studentEmails = await consentCollection.find(
//             { driveId: driveId, _id: { $in: selectedStudents.map(id => new ObjectId(id)) } },
//             { projection: { pemail: 1 } }
//         ).toArray();

//         const emailAddresses = studentEmails.map(student => student.pemail);

//         // Send emails
//         for (const email of emailAddresses) {
//             await sendEmail(email, 'Final Result', 'Congratulations, you have been selected!');
//         }

//         res.status(200).json({ message: 'Emails sent successfully' });
//     } catch (error) {
//         console.error('Error sending emails:', error);
//         res.status(500).json({ message: 'Error sending emails' });
//     }
// });



app.get('/student/:studentId', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        console.log(`Received request to fetch student with ID: ${studentId}`);


        const studentCollection = db.collection('students');
        const student = await studentCollection.findOne({ _id: new ObjectId(studentId) }, { projection: { name: 1 } });

        if (student) {
            console.log(`Student found: ${student.name}`);
            res.json({ name: student.name });
        } else {
            console.log('Student not found');
            res.status(404).send('Student not found');
        }
    } catch (err) {
        console.error('Error fetching student:', err);
        res.status(500).send('Server Error');
    }
});

app.get('/studentsList-byRound/:driveId/:roundId', async (req, res) => {
    try {
        const { driveId, roundId } = req.params;
        console.log("For", driveId, "and ", roundId, ":");
        const roundsCollection = db.collection('rounds');

        const round = await roundsCollection.findOne({ driveId: driveId, roundId: parseInt(roundId) });
        console.log("Round: ", round);
        if (!round || !round.selectedStudents) {
            return res.status(404).json({ message: 'No students found for this round' });
        }

        res.json(round.selectedStudents);

    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).send('Server Error');
    }
});


app.get('/studentsDisplayData-byRound/:driveId/:roundId', async (req, res) => {
    try {
        const { driveId, roundId } = req.params;
        const consentCollection = db.collection('consents');

        const retu = [];

        // Fetch student IDs from the previous round
        let response = await fetch(`http://localhost:5500/studentsList-byRound/${driveId}/${parseInt(roundId) - 1}`);

        const studentIDsPrevRound = await response.json();
        console.log("previousstudentIDs", studentIDsPrevRound);

        // Check if studentIDsPrevRound is an array, handle non-array case if needed
        const studentIDs = Array.isArray(studentIDsPrevRound) ? studentIDsPrevRound : [];
        console.log("studentsIDs", studentIDs);

        // Fetch student IDs from the current round
        response = await fetch(`http://localhost:5500/studentsList-byRound/${driveId}/${roundId}`);
        const checkedStudentIDs = await response.json();

        // Process each student ID
        for (const studentID of studentIDs) {
            // Determine if studentID is checked in the current round
            const checked = checkedStudentIDs.includes(studentID);

            // Fetch student details from `consents` collection
            const student = await consentCollection.findOne({ driveId: driveId, _id: new ObjectId(studentID) });

            // Prepare student data for response
            const studentData = {
                fname: student.fname,
                pemail: student.pemail,
                resumelink: student.resumelink,
                studentID: student._id,
                checked: checked
            };
            console.log(studentData);
            retu.push(studentData);
        }
        console.log(retu);
        res.json(retu);

    } catch (err) {
        console.error('Error fetching details:', err);
        res.status(500).json({ message: 'Server Error' }); // Ensure JSON response
    }
});


app.post('/updateStudentsList', async (req, res) => {
    const { driveId, roundId, studentId, checked } = req.body;

    if (!driveId || !roundId || !studentId || typeof checked !== 'boolean') {
        return res.status(400).send({ message: 'Invalid request data' });
    }

    try {
        const rounds = database.collection('rounds');

        let update;
        if (checked) {
            update = { $addToSet: { selectedStudents: studentId } }; // Adds studentId if not already present
        } else {
            update = { $pull: { selectedStudents: studentId } }; // Removes studentId if present
        }

        const result = await rounds.updateOne(
            { driveId: driveId, roundId: roundId },
            update
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ message: 'Document not found' });
        }

        res.status(200).send({ message: 'Updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

app.get('/recruiter/:recId', async (req, res) => {
    try {
        const recId = req.params.recId;
        console.log(`Received request to fetch recruiter with ID: ${recId}`);


        const recruiterCollection = db.collection('recruiters');
        const recruiter = await recruiterCollection.findOne({ _id: new ObjectId(recId) }, { projection: { name: 1 } });

        if (recruiter) {
            console.log(`Recruiter found: ${recruiter.name}`);
            res.json({ name: recruiter.name });
        } else {
            console.log('Recruiter  not found');
            res.status(404).send('Recruiter not found');
        }
    } catch (err) {
        console.error('Error fetching Recruiter:', err);
        res.status(500).send('Server Error');
    }
});

// app.get('/selectedStudents-lastRound/:driveId', async (req, res) => {
//     try {
//         const { driveId } = req.params;

//         const roundsCollection = db.collection('rounds');

//         // Find the round with the highest roundId for the given driveId
//         const lastRound = await roundsCollection.find({ driveId: driveId }).sort({ roundId: -1 }).limit(1).toArray();

//         if (!lastRound.length) {
//             return res.status(404).json({ message: 'No rounds found for this drive' });
//         }

//         const selectedStudents = lastRound[0].selectedStudents || [];
//         console.log(selectedStudents);
//         res.json(selectedStudents);
//     } catch (err) {
//         console.error('Error fetching selected students:', err);
//         res.status(500).json({ message: 'Server Error' });
//     }
// });

app.post('/send-email', async (req, res) => {
    const { email, subject, text } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'bcs_2022016@iiitm.ac.in',
                pass: 'abcd1234'
            }
        });

        let mailOptions = {
            from: 'bcs_2022016@iiitm.ac.in', // Replace with your email
            to: email,
            subject: subject,
            text: text
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending email' });
    }
});

app.get('/consents/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const consentCollection = db.collection('consents');

        const student = await consentCollection.findOne({ _id: new ObjectId(studentId) });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Endpoint to get selected students for a specific round
app.get('/get-round-selected-students/:driveId/:roundId', async (req, res) => {
    try {
      const { driveId, roundId } = req.params;
      const roundCollection = db.collection('rounds');

      const round = await roundCollection.findOne({ driveId, roundId });
      if (round) {
        res.json(round.selectedStudents);
      } else {
        res.status(404).send('Round not found');
      }
    } catch (error) {
      res.status(500).send('Error fetching selected students');
    }
  });

  
  // Endpoint to get pemail from consents database
  app.get('/get-consent/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      const consentCollection = db.collection('consents');
      const consent = await consentCollection.findOne({ _id: new ObjectId(studentId) });

      if (consent) {
        res.json({ pemail: consent.pemail });
      } else {
        res.status(404).send('Student not found');
      }
    } catch (error) {
      res.status(500).send('Error fetching student consent');
    }
  });
  
  // Endpoint to send selection emails
  app.post('/send-selection-emails', async (req, res) => {
    try {
      const { emails } = req.body;
      // Logic to send emails
      res.send('Emails sent successfully');
    } catch (error) {
      res.status(500).send('Error sending emails');
    }
  });

  app.post('/send-selection-email', async (req, res) => {
    const { email, subject, text } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'bcs_2022016@iiitm.ac.in',
                pass: 'abcd1234'
            }
        });

        let mailOptions = {
            from: 'bcs_2022016@iiitm.ac.in', // Replace with your email
            to: email,
            subject: subject,
            text: text
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending email' });
    }
});
  
app.post('/declareResults', async (req, res) => {
    const { driveId } = req.body;
    // Update the drive status to 'declared'
    const drivesCollection=db.collection('drives')
    await drivesCollection.findOneAndUpdate({ _id: new ObjectId (driveId) }, { $set: { resultsDeclared: 'true' } });
    res.status(200).send('Results declared');
});

// Example endpoint to get the declared state
app.get('/isResultsDeclared/:driveId', async (req, res) => {
    const { driveId } = req.params;
    const drivesCollection=db.collection('drives')
    const drive = await drivesCollection.findOne({_id:new ObjectId (driveId)});
    console.log(drive);
    res.json({ resultsDeclared: drive.resultsDeclared });
});

app.post('/declareRoundResults', async (req, res) => {
    const { driveId, roundId } = req.body;
    const roundsCollection = db.collection('rounds');

    await roundsCollection.updateOne(
        { driveId: driveId, roundId: parseInt(roundId) },
        { $set: { resultsDeclared: 'true' } }
    );

    res.status(200).send('Results declared');
});


app.get('/isRoundResultsDeclared/:driveId/:roundId', async (req, res) => {
    const { driveId, roundId } = req.params;
    const roundsCollection = db.collection('rounds');
    const round = await roundsCollection.findOne({ driveId: driveId, roundId: parseInt(roundId) });

    if (!round) {
        return res.status(404).json({ error: 'Round not found' });
    }

    res.json({ resultsDeclared: round.resultsDeclared });
});




const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});