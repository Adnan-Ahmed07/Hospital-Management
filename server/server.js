require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { Readable } = require('stream');

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 5000;

// Resolve Mongo URI with Validation
// We check multiple env vars and fall back to the hardcoded string if needed
let resolvedUri = process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGODB_URI;

// Hardcoded fallback credentials provided by user
const FALLBACK_URI = 'mongodb+srv://masudrana52443:Adnan1055@cluster0.o4jwx.mongodb.net/ad_hospital';

// If env var is missing or malformed (e.g. contains assignment), clean it or use fallback
if (!resolvedUri || !resolvedUri.startsWith('mongodb')) {
    // Attempt to clean specific malformed pattern "MONGO_URI=MONGO_URL=..."
    if (resolvedUri && resolvedUri.includes('mongodb+srv://')) {
        const match = resolvedUri.match(/(mongodb\+srv:\/\/[^\s]+)/);
        resolvedUri = match ? match[0] : FALLBACK_URI;
    } else {
        console.warn('Environment variable for MongoDB missing or malformed. Using fallback credentials.');
        resolvedUri = FALLBACK_URI;
    }
}

const MONGO_URI = resolvedUri;

// Middleware
app.use(cors());
app.use(express.json());

// Request Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- Mock Email Service ---
const sendEmail = (to, subject, body) => {
    console.log('\n--- 📧 EMAIL NOTIFICATION SENT ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: \n${body}`);
    console.log('----------------------------------\n');
};

// --- Cloudinary Config ---
let cloudinary;
try {
    cloudinary = require('cloudinary').v2;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        console.log('Cloudinary Configured');
    }
} catch (e) {
    console.log('Cloudinary not available (skipping)');
}

const upload = multer({ storage: multer.memoryStorage() });

// --- Mongoose Models ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'doctor', 'patient'], default: 'patient' }
});
const User = mongoose.model('User', userSchema);

const doctorSchema = new mongoose.Schema({
    name: String,
    email: String,
    specialization: String,
    image: String,
    availability: [String],
    experience: Number,
    description: String
});
const Doctor = mongoose.model('Doctor', doctorSchema);

const appointmentSchema = new mongoose.Schema({
    patientName: String,
    patientEmail: String,
    patientPhone: String,
    doctorId: String,
    doctorName: String,
    date: Date,
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    symptoms: String,
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: true } // Notifications: default true (read) for creator
});
const Appointment = mongoose.model('Appointment', appointmentSchema);

const newsSchema = new mongoose.Schema({
    title: String,
    content: String,
    date: Date,
    image: String,
    category: String
});
const News = mongoose.model('News', newsSchema);

// --- Data Seeding ---
const seedDatabase = async () => {
    try {
        const docCount = await Doctor.countDocuments();
        if (docCount === 0) {
            console.log('Seeding Doctors...');
            await Doctor.insertMany([
                {
                    name: 'Dr. Sarah Johnson',
                    email: 'sarah@hospital.com',
                    specialization: 'Cardiology',
                    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
                    availability: ['Mon', 'Wed', 'Fri'],
                    experience: 12,
                    description: 'Expert cardiologist with over a decade of experience in treating complex heart conditions.'
                },
                {
                    name: 'Dr. Michael Chen',
                    email: 'michael@hospital.com',
                    specialization: 'Neurology',
                    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300',
                    availability: ['Tue', 'Thu'],
                    experience: 8,
                    description: 'Specializes in neurological disorders and stroke rehabilitation.'
                },
                {
                    name: 'Dr. Emily Williams',
                    email: 'emily@hospital.com',
                    specialization: 'Pediatrics',
                    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300',
                    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                    experience: 15,
                    description: 'Dedicated to providing compassionate care for children of all ages.'
                }
            ]);
        }
        
        const adminExists = await User.findOne({ email: 'admin@medicare.com' });
        if (!adminExists) {
            console.log('Seeding Admin...');
            await User.create({
                name: 'Admin User',
                email: 'admin@medicare.com',
                password: 'admin123',
                role: 'admin'
            });
        }
        
        // Seed initial doctor user accounts
        const doctors = await Doctor.find();
        for (const doc of doctors) {
            if (doc.email) {
                const userExists = await User.findOne({ email: doc.email });
                if (!userExists) {
                    console.log(`Seeding Doctor User: ${doc.name}`);
                    await User.create({
                        name: doc.name,
                        email: doc.email,
                        password: 'doctor123',
                        role: 'doctor'
                    });
                }
            }
        }

        // Seed initial news items if none exist
        const newsCount = await News.countDocuments();
        if (newsCount === 0) {
            console.log('Seeding News Items...');
            await News.insertMany([
                {
                    title: 'Breakthrough in Alzheimer\'s Research',
                    content: 'Our research team has identified a new protein marker that could lead to earlier detection.',
                    date: new Date('2024-01-10'),
                    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200',
                    category: 'announcement'
                },
                {
                    title: 'New Pediatric Wing Opens',
                    content: 'We are proud to announce the opening of our state-of-the-art pediatric wing, designed with child comfort in mind.',
                    date: new Date('2024-02-15'),
                    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200',
                    category: 'announcement'
                },
                {
                    title: 'Community Health Camp',
                    content: 'Join our free community screening camp offering health checks and counseling for all ages.',
                    date: new Date('2024-03-20'),
                    image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1200',
                    category: 'event'
                },
                {
                    title: 'Free Vaccination Drive',
                    content: 'We are running a vaccination drive this weekend for seasonal flu and selected vaccines.',
                    date: new Date('2024-04-05'),
                    image: 'https://images.unsplash.com/photo-1584036561584-b03c19da874c?auto=format&fit=crop&q=80&w=1200',
                    category: 'announcement'
                },
                {
                    title: 'Hospital Tour Video',
                    content: 'Take a guided video tour of our new facilities and services.',
                    date: new Date('2024-05-01'),
                    image: 'https://res.cloudinary.com/demo/video/upload/w_1200,h_675,c_fill/sample.mp4',
                    category: 'event'
                }
            ]);
        }

        console.log('Database Seeding Check Complete.');
    } catch (error) {
        console.error('Seeding error:', error);
    }
};

// --- Connection Logic ---
const connectDB = async () => {
    console.log(`Connecting to MongoDB...`);
    // Mask URI for logging safety
    const maskedURI = MONGO_URI.replace(/:([^:@]+)@/, ':****@');
    console.log(`Using URI: ${maskedURI}`);

    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Fail fast if network is down
        });
        console.log('>>> MongoDB CONNECTED Successfully <<<');
        seedDatabase();
    } catch (err) {
        console.error('MongoDB Connection Failed:', err.message);
        console.log('Please ensure your IP is whitelisted in MongoDB Atlas Network Access.');
    }
};

connectDB();

// --- Routes ---
app.get('/', (req, res) => res.send('AD Hospital API Online'));

app.get('/api/health', (req, res) => {
    const state = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.json({
        server: 'online',
        database: states[state] || 'unknown',
        cloudinary: (typeof cloudinary !== 'undefined' && cloudinary) ? 'configured' : 'not-configured'
    });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        
        // Logic: All users are 'patient' by default. 
        // EXCEPTION: If the email already exists in the 'Doctors' directory (added by Admin), they become a 'doctor' immediately.
        const isDoctor = await Doctor.findOne({ email });
        const role = isDoctor ? 'doctor' : 'patient';
        
        const user = await User.create({ name, email, password, role });
        res.status(201).json({ user: { id: user._id, ...user.toObject() }, token: 'jwt_mock_' + user._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
        res.json({ user: { id: user._id, ...user.toObject() }, token: 'jwt_mock_' + user._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// Doctor Routes
app.get('/api/doctors', async (req, res) => {
    try {
        const { email } = req.query;
        let query = {};
        if (email) query.email = email;
        const docs = await Doctor.find(query);
        res.json(docs.map(d => ({ ...d.toObject(), id: d._id })));
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/doctors', async (req, res) => {
    try {
        // Create Doctor Profile
        const doc = await Doctor.create(req.body);
        
        // ADMIN ACTION: If a user with this email exists, promote them to 'doctor'
        if (doc.email) {
            await User.findOneAndUpdate({ email: doc.email }, { role: 'doctor' });
        }
        
        res.json({ ...doc.toObject(), id: doc._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/doctors/:id', async (req, res) => {
    try {
        const doc = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // ADMIN ACTION: Sync role
        if (doc.email) {
            await User.findOneAndUpdate({ email: doc.email }, { role: 'doctor' });
        }
        
        res.json({ ...doc.toObject(), id: doc._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/doctors/:id', async (req, res) => {
    try {
        const doc = await Doctor.findById(req.params.id);
        
        // ADMIN ACTION: If doctor profile is deleted, demote user to 'patient'
        if (doc && doc.email) {
            await User.findOneAndUpdate({ email: doc.email }, { role: 'patient' });
        }
        
        await Doctor.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// Appointment Routes
app.get('/api/appointments', async (req, res) => {
    try {
        const { patientEmail, doctorId } = req.query;
        let query = {};
        if (patientEmail) query.patientEmail = patientEmail;
        if (doctorId) query.doctorId = doctorId;
        const appts = await Appointment.find(query).sort({ date: 1 });
        res.json(appts.map(a => ({ ...a.toObject(), id: a._id })));
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/appointments', async (req, res) => {
    try {
        const { doctorId, date } = req.body;
        const exists = await Appointment.findOne({ doctorId, date: new Date(date), status: { $ne: 'cancelled' } });
        if (exists) return res.status(400).json({ message: 'Slot already booked' });
        // isRead defaults to true in schema, which is correct for creation
        const appt = await Appointment.create(req.body);
        res.json({ ...appt.toObject(), id: appt._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/appointments/booked-slots', async (req, res) => {
    try {
        const { doctorId, date } = req.query;
        const start = new Date(date); start.setHours(0,0,0,0);
        const end = new Date(date); end.setHours(23,59,59,999);
        const appts = await Appointment.find({ doctorId, date: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } });
        const times = appts.map(a => {
            const d = new Date(a.date);
            return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
        });
        res.json(times);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/appointments/:id', async (req, res) => {
    try {
        const { status, isRead } = req.body;
        
        // Notification Logic: If status changes to non-pending, mark as unread for patient
        // Unless isRead is explicitly provided (e.g., dismissing notification)
        if (status && status !== 'pending') {
            if (isRead === undefined) {
                req.body.isRead = false;
            }
        }
        
        const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // Send Email if status confirmed
        if (status === 'confirmed') {
             const dateStr = new Date(appt.date).toLocaleString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
             });
             
             sendEmail(
                appt.patientEmail,
                'Appointment Confirmed - AD Hospital',
                `Dear ${appt.patientName},\n\nYour appointment with ${appt.doctorName} on ${dateStr} has been CONFIRMED.\n\nPlease arrive 15 minutes before your scheduled time.\n\nRegards,\nAD Hospital Admin`
             );
        }
        
        res.json({ ...appt.toObject(), id: appt._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// News Routes
app.get('/api/news', async (req, res) => {
    try {
        const news = await News.find().sort({ date: -1 });
        res.json(news.map(n => ({ ...n.toObject(), id: n._id })));
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/news', async (req, res) => {
    try {
        const n = await News.create(req.body);
        res.json({ ...n.toObject(), id: n._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/news/:id', async (req, res) => {
    try {
        const n = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ ...n.toObject(), id: n._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/news/:id', async (req, res) => {
    try {
        await News.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// Upload Route
app.post('/api/upload', upload.single('file'), (req, res) => {
    if(!req.file) return res.status(400).json({message: 'No file'});
    if(!cloudinary) return res.status(503).json({message: 'Cloudinary not configured'});
    const stream = cloudinary.uploader.upload_stream({ folder: 'ad_hospital', resource_type: 'auto' }, (err, result) => {
        if(err) return res.status(500).json({message: 'Upload failed', error: err.message});
        res.json({ url: result.secure_url });
    });
    Readable.from(req.file.buffer).pipe(stream);
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));