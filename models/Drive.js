const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema({
    name: { type: String, required: true },
    programs: {
        bachelor: [String],
        master: [String],
        associate: [String],
        phd: { type: Boolean, default: false }
    },
    batch: { type: Number, required: true },
    criteria: {
        cgpa: { type: Number, min: 0 },
        backlogs: { type: Number, min: 0 }
    },
    package: {
        min: { type: Number, min: 0 },
        max: { type: Number, min: 0 }
    },
    dateOfDrive: { type: Date, required: true },
    lastDateOfApplication: { type: Date, required: true },
    designations: [String],
    jobDescription: { type: String }
});

module.exports = mongoose.model('Drive', driveSchema);
