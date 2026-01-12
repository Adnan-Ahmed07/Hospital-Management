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
    createdAt: { type: Date, default: Date.now }
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
                    specialization: 'Cardiology',
                    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
                    availability: ['Mon', 'Wed', 'Fri'],
                    experience: 12,
                    description: 'Expert cardiologist with over a decade of experience in treating complex heart conditions.'
                },
                {
                    name: 'Dr. Michael Chen',
                    specialization: 'Neurology',
                    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300',
                    availability: ['Tue', 'Thu'],
                    experience: 8,
                    description: 'Specializes in neurological disorders and stroke rehabilitation.'
                },
                {
                    name: 'Dr. Emily Williams',
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
    });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        const user = await User.create({ name, email, password, role: 'patient' });
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
        const doc = await Doctor.create(req.body);
        res.json({ ...doc.toObject(), id: doc._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/doctors/:id', async (req, res) => {
    try {
        const doc = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ ...doc.toObject(), id: doc._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/doctors/:id', async (req, res) => {
    try {
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
        const appt = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
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