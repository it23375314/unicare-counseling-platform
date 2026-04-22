// MOCK DATABASE MODEL - Ready to be replaced by Mongoose
class SessionNote {
    constructor(data) {
        Object.assign(this, data);
        if (!this._id) this._id = Date.now().toString();
        this.id = this._id;
        if (!this.status) this.status = "Draft";
        if (!this.createdAt) this.createdAt = new Date().toISOString();
    }

    async save() {
        SessionNote.data.push(this);
        return this;
    }

    static async find(query = {}) {
        let results = [...SessionNote.data];
        for (let key in query) {
            if (typeof query[key] === 'object' && query[key].$regex) {
                const regex = new RegExp(query[key].$regex, query[key].$options || '');
                results = results.filter(item => regex.test(item[key]));
            } else {
                results = results.filter(item => item[key] === query[key]);
            }
        }
        
        let mockCursor = results;
        mockCursor.sort = () => results; // Mock sort to chain
        return mockCursor;
    }

    static async findById(id) {
        return SessionNote.data.find(d => d._id === id || d.id === id);
    }

    static async findByIdAndUpdate(id, body, options) {
        const item = SessionNote.data.find(d => d._id === id || d.id === id);
        if (item) {
            Object.assign(item, body);
            return item;
        }
        return null;
    }

    static async findByIdAndDelete(id) {
        const index = SessionNote.data.findIndex(d => d._id === id || d.id === id);
        if (index > -1) {
            return SessionNote.data.splice(index, 1)[0];
        }
        return null;
    }
}

// Initial Mock Data
SessionNote.data = [
    new SessionNote({
        _id: "1",
        appointmentId: "appt-101",
        studentId: "STD-1774",
        studentName: "Dilshan Wijesinghe",
        counsellorId: "1",
        title: "Anxiety Management Follow-up",
        notes: "Student is showing progress with breathing exercises.",
        riskLevel: "Low",
        status: "Completed",
        sessionDate: "2026-03-29",
        counsellorAssessment: "Continue current exercises."
    })
];

module.exports = SessionNote;
