require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { Readable } = require('stream');
const nodemailer = require('nodemailer');

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 5000;

// Resolve Mongo URI with Validation
let resolvedUri = process.env.MONGO_URI || process.env.MONGO_URL || process.env.MONGODB_URI;
const FALLBACK_URI = 'mongodb+srv://masudrana52443:Adnan1055@cluster0.o4jwx.mongodb.net/ad_hospital';

if (!resolvedUri || !resolvedUri.startsWith('mongodb')) {
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

// --- Nodemailer Transporter ---
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your preferred provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Email Helper Function
const sendConfirmationEmail = async (appointment) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('--- Email Simulated (No Credentials) ---');
        console.log(`To: ${appointment.patientEmail}`);
        console.log(`Subject: Appointment Confirmed with Dr. ${appointment.doctorName}`);
        console.log(`Details: ${new Date(appointment.date).toLocaleString()}`);
        return;
    }

    const mailOptions = {
        from: `"AD Hospital" <${process.env.EMAIL_USER}>`,
        to: appointment.patientEmail,
        subject: `Confirmed: Appointment with Dr. ${appointment.doctorName}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
                <div style="background-color: #0d9488; padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Appointment Confirmed</h1>
                </div>
                <div style="padding: 40px; background-color: #ffffff;">
                    <p style="font-size: 18px; font-weight: 600;">Hello ${appointment.patientName},</p>
                    <p style="line-height: 1.6;">Your appointment request at <strong>AD Hospital</strong> has been successfully reviewed and confirmed by our medical team.</p>
                    
                    <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-top: 0; letter-spacing: 0.05em;">Visit Details</h2>
                        <p style="margin: 5px 0;"><strong>Doctor:</strong> Dr. ${appointment.doctorName}</p>
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
                        <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>

                    <p style="line-height: 1.6;">Please arrive 15 minutes prior to your scheduled time. If this is a tele-consultation, your meeting link will be available in your patient dashboard.</p>
                    
                    <div style="text-align: center; margin-top: 40px;">
                        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/#/patient-dashboard" 
                           style="background-color: #0f172a; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                           View Patient Dashboard
                        </a>
                    </div>
                </div>
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                    <p>&copy; ${new Date().getFullYear()} AD Hospital. 123 Hospital Ave, Gulshan, Dhaka.</p>
                    <p>Hotline: 10666 | Emergency: 999</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${appointment.patientEmail}`);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
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
    isRead: { type: Boolean, default: true },
    meetingLink: String,
    flowStatus: { type: String, enum: ['checked-in', 'vitals', 'consulting', 'complete'], default: 'checked-in' }
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
        
        // Ensure Doctor Users
        const doctors = await Doctor.find();
        for (const doc of doctors) {
            if (doc.email) {
                const userExists = await User.findOne({ email: doc.email });
                if (!userExists) {
                    await User.create({
                        name: doc.name,
                        email: doc.email,
                        password: 'doctor123',
                        role: 'doctor'
                    });
                }
            }
        }
        console.log('Database Seeding Check Complete.');
    } catch (error) {
        console.error('Seeding error:', error);
    }
};

const connectDB = async () => {
    console.log(`Connecting to MongoDB...`);
    try {
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('>>> MongoDB CONNECTED Successfully <<<');
        seedDatabase();
    } catch (err) {
        console.error('MongoDB Connection Failed:', err.message);
    }
};
connectDB();

// --- Routes ---
app.get('/', (req, res) => res.send('AD Hospital API Online'));
app.get('/api/health', (req, res) => res.json({ server: 'online', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already exists' });
        const isDoctor = await Doctor.findOne({ email });
        const user = await User.create({ name, email, password, role: isDoctor ? 'doctor' : 'patient' });
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
        const query = email ? { email } : {};
        const docs = await Doctor.find(query);
        res.json(docs.map(d => ({ ...d.toObject(), id: d._id })));
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/doctors', async (req, res) => {
    try {
        const doc = await Doctor.create(req.body);
        if (doc.email) await User.findOneAndUpdate({ email: doc.email }, { role: 'doctor' });
        res.json({ ...doc.toObject(), id: doc._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put('/api/doctors/:id', async (req, res) => {
    try {
        const doc = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (doc.email) await User.findOneAndUpdate({ email: doc.email }, { role: 'doctor' });
        res.json({ ...doc.toObject(), id: doc._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/doctors/:id', async (req, res) => {
    try {
        const doc = await Doctor.findById(req.params.id);
        if (doc && doc.email) await User.findOneAndUpdate({ email: doc.email }, { role: 'patient' });
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
        
        const appt = await Appointment.create({ ...req.body, flowStatus: 'checked-in' });
        res.json({ ...appt.toObject(), id: appt._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// --- FEATURE 1: AI-Assisted Scheduling ---
app.post('/api/appointments/ai-schedule', async (req, res) => {
    try {
        const { doctorId, date } = req.body;
        
        const start = new Date(date); start.setHours(0,0,0,0);
        const end = new Date(date); end.setHours(23,59,59,999);
        const booked = await Appointment.find({ doctorId, date: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } });
        
        const bookedTimes = booked.map(a => {
            const d = new Date(a.date);
            return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
        });

        const allSlots = [];
        for (let i = 9; i <= 17; i++) {
            allSlots.push(`${i.toString().padStart(2,'0')}:00`);
            allSlots.push(`${i.toString().padStart(2,'0')}:30`);
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const reqDateStr = new Date(date).toISOString().split('T')[0];
        const isToday = todayStr === reqDateStr;
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const available = allSlots.filter(s => {
            if (bookedTimes.includes(s)) return false;
            if (isToday) {
                const [h, m] = s.split(':').map(Number);
                if (h < currentHour) return false;
                if (h === currentHour && m <= currentMinute) return false;
            }
            return true;
        });
        
        if (available.length === 0) return res.status(400).json({ message: 'No slots available for this date.' });

        // AI Heuristic: Prefer mid-morning or mid-afternoon
        let bestSlot = available[0];
        const preferred = ['10:00', '10:30', '11:00', '14:00', '14:30', '15:00'];
        const match = available.find(s => preferred.includes(s));
        
        let reason = "Earliest available slot.";
        if (match) {
            bestSlot = match;
            reason = "Optimal slot for reduced wait time & doctor energy levels.";
        } else if (available.length < 5) {
            reason = "Limited availability, grabbing last spots.";
        }

        res.json({ recommendedSlot: bestSlot, reason: reason });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// --- FEATURE 2: Integrated Telemedicine ---
app.post('/api/appointments/:id/telemedicine', async (req, res) => {
    try {
        const appt = await Appointment.findById(req.params.id);
        if (!appt) return res.status(404).json({ message: 'Appointment not found' });
        
        const roomName = `ADH-${appt._id}-${Math.random().toString(36).substring(7)}`;
        const link = `https://meet.jit.si/${roomName}`;
        
        appt.meetingLink = link;
        await appt.save();
        res.json({ link });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// --- FEATURE 5: FHIR & EHR Compatibility ---
app.get('/api/patients/:email/fhir', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ message: 'Patient not found' });
        
        const appointments = await Appointment.find({ patientEmail: req.params.email });

        const fhirBundle = {
            resourceType: "Bundle",
            type: "document",
            entry: [
                {
                    resource: {
                        resourceType: "Patient",
                        id: user._id,
                        name: [{ family: user.name.split(' ').pop(), given: user.name.split(' ').slice(0, -1) }],
                        telecom: [{ system: "email", value: user.email }]
                    }
                },
                ...appointments.map(appt => ({
                    resource: {
                        resourceType: "Encounter",
                        id: appt._id,
                        status: appt.status === 'confirmed' ? 'planned' : 'cancelled',
                        class: { system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: "AMB", display: "ambulatory" },
                        period: { start: appt.date },
                        reasonCode: [{ text: appt.symptoms }]
                    }
                }))
            ]
        };
        res.json(fhirBundle);
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
        const { status } = req.body;
        const oldAppt = await Appointment.findById(req.params.id);
        
        if (!oldAppt) return res.status(404).json({ message: 'Appointment not found' });

        if (status && status !== 'pending') {
            if (req.body.isRead === undefined) req.body.isRead = false;
        }

        const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // Trigger Confirmation Email if status changed to 'confirmed'
        if (oldAppt.status !== 'confirmed' && status === 'confirmed') {
            sendConfirmationEmail(appt);
        }

        res.json({ ...appt.toObject(), id: appt._id });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// --- FEATURE 6: AI Chatbot Endpoint ---
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        // Dynamic import because @google/genai is ESM
        const { GoogleGenAI } = await import('@google/genai');

        if (!process.env.API_KEY) {
             // Fallback for demo if API key is not set
             return res.json({ text: "I'm sorry, I can't connect to the AI service right now. Please configure the API Key." });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const contents = [];
        if (history && Array.isArray(history)) {
            history.forEach(msg => {
                contents.push({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                });
            });
        }
        // Add current message
        contents.push({ role: 'user', parts: [{ text: message }] });

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: contents,
            config: {
                systemInstruction: "You are a helpful, empathetic medical assistant for AD Hospital. Your name is 'AD Assistant'. You help patients find doctors, understand services, and get general health information. You can provide general advice but NEVER provide a specific medical diagnosis. Always be concise and polite. If asked about doctors, mention we have specialists in Cardiology, Neurology, Pediatrics, etc.",
            }
        });

        res.json({ text: response.text });
    } catch (e) {
        console.error("Chat Error:", e);
        res.status(500).json({ message: "Failed to generate response." });
    }
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

// Upload
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