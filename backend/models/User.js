// MOCK DATABASE MODEL - Ready to be replaced by Mongoose
class User {
    constructor(data) {
        Object.assign(this, data);
        if (!this._id) this._id = Date.now().toString();
        this.id = this._id;
    }

    async save() {
        User.data.push(this);
        return this;
    }

    static async find(query = {}) {
        let results = [...User.data];
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
        return User.data.find(d => d._id === id || d.id === id);
    }

    static async findByIdAndUpdate(id, body) {
        const item = User.data.find(d => d._id === id || d.id === id);
        if (item) {
            Object.assign(item, body);
            return item;
        }
        return null;
    }

    static async findByIdAndDelete(id) {
        const index = User.data.findIndex(d => d._id === id || d.id === id);
        if (index > -1) {
            return User.data.splice(index, 1)[0];
        }
        return null;
    }
}

// Initial Mock Data
User.data = [
    new User({ _id: "student-1", role: "student", name: "Current Student", email: "student@unicare.edu" }),
    new User({ _id: "1", role: "counsellor", name: "Dr. Sarah Jenkins", email: "sarah.jenkins@unicare.edu" })
];

module.exports = User;
