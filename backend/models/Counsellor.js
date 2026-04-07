<<<<<<< HEAD
// MOCK DATABASE MODEL - Ready to be replaced by Mongoose
class Counsellor {
    constructor(data) {
        Object.assign(this, data);
        if (!this._id) this._id = Date.now().toString();
        this.id = this._id;
        if (!this.availability) this.availability = [];
    }

    async save() {
        Counsellor.data.push(this);
        return this;
    }

    static async find(query = {}) {
        let results = [...Counsellor.data];
        for (let key in query) {
            results = results.filter(item => item[key] === query[key]);
        }
        results.sort = () => results;
        return results;
    }

    static async findOne(query = {}) {
        const results = await this.find(query);
        return results[0] || null;
    }

    static async findById(id) {
        return Counsellor.data.find(d => d._id === id || d.id === id);
    }

    static async findByIdAndUpdate(id, body, options) {
        const item = Counsellor.data.find(d => d._id === id || d.id === id);
        if (item) {
            Object.assign(item, body);
            return item;
        }
        return null;
    }

    static async findByIdAndDelete(id) {
        const index = Counsellor.data.findIndex(d => d._id === id || d.id === id);
        if (index > -1) {
            return Counsellor.data.splice(index, 1)[0];
        }
        return null;
    }
}

// Initial Mock Data mapped from frontend
Counsellor.data = [
    new Counsellor({
        _id: "1",
        name: "Dr. Sarah Jenkins",
        email: "sarah.jenkins@unicare.edu",
        specialization: "Anxiety & Academic Stress",
        experience: "10 years",
        availability: []
    }),
    new Counsellor({
        _id: "2",
        name: "Dr. Ahmed Rahman",
        email: "ahmed.rahman@unicare.edu",
        specialization: "Depression & Career Counseling",
        experience: "8 years",
        availability: []
    })
];

module.exports = Counsellor;
=======
const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  slots: [{
    type: String // HH:MM AM/PM
  }]
});

const counsellorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"
  },
  price: {
    type: Number,
    default: 40
  },
  availability: [availabilitySchema]
}, { timestamps: true });

module.exports = mongoose.model('Counsellor', counsellorSchema);
>>>>>>> 4ccf38913c13d612b5f36df71f8c1efaa2b43708
