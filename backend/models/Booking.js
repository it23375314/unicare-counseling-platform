// MOCK DATABASE MODEL - Ready to be replaced by Mongoose
class Booking {
    constructor(data) {
        Object.assign(this, data);
        if (!this._id) this._id = Date.now().toString();
        this.id = this._id;
        if (!this.status) this.status = "Pending";
        if (!this.createdAt) this.createdAt = new Date().toISOString();
    }

    async save() {
        Booking.data.push(this);
        return this;
    }

    static async find(query = {}) {
        let results = [...Booking.data];
        for (let key in query) {
            if (typeof query[key] === 'object' && query[key].$ne) {
                results = results.filter(item => item[key] !== query[key].$ne);
            } else {
                results = results.filter(item => item[key] === query[key]);
            }
        }
        results.sort = () => results;
        return results;
    }

    static async findOne(query = {}) {
         const results = await this.find(query);
         return results[0] || null;
    }

    static async findById(id) {
        return Booking.data.find(d => d._id === id || d.id === id);
    }

    static async findByIdAndUpdate(id, body, options) {
        const item = Booking.data.find(d => d._id === id || d.id === id);
        if (item) {
            Object.assign(item, body);
            return item;
        }
        return null;
    }

    static async findByIdAndDelete(id) {
        const index = Booking.data.findIndex(d => d._id === id || d.id === id);
        if (index > -1) {
            return Booking.data.splice(index, 1)[0];
        }
        return null;
    }
}

// Initial Mock Data
Booking.data = [
    new Booking({
        _id: "appt-101",
        counsellor: "Dr. Sarah Jenkins",
        studentName: "Dilshan Wijesinghe",
        studentId: "STD-1774",
        studentEmail: "dilshan.w@university.edu.lk",
        studentContact: "+94 77 123 4567",
        date: "2026-03-29",
        time: "09:00 AM",
        sessionType: "Initial Assessment",
        status: "Completed",
        createdAt: new Date().toISOString()
    }),
    new Booking({
        _id: "appt-102",
        counsellor: "Dr. Sarah Jenkins",
        studentName: "Sithumini Fonseka",
        studentId: "STD-2491",
        studentEmail: "sithumini.f@university.edu.lk",
        studentContact: "+94 71 987 6543",
        date: "2026-03-30",
        time: "11:30 AM",
        sessionType: "Follow-up Counseling",
        status: "Confirmed",
        createdAt: new Date().toISOString()
    })
];

module.exports = Booking;
