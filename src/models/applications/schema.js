import mongoose from 'mongoose';

import { modelNames, paymentMethods } from '../../utils/constants';

const applicantSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    dateOfBirth: { type: Date, required: true },
    countryOfBirth: { type: String, required: true },
    countryOfEligibility: { type: String, required: true },
    email: { type: String, required: true, unique: false },
    phone: { type: String, unique: true },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    educationLevel: {
      level: {
        type: String,
        enum: [
          'Primary School only',
          'High School, no degree',
          'High School degree',
          'Vocational School',
          'Some University Courses',
          'University Degree',
          'Some Graduate Level Courses',
          "Master's Degree",
          'Some Doctorate Level Courses',
          'Doctorate Degree',
        ],
      },
      details: String,
    },
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Legally Separated'],
      required: true,
    },
    photoUrl: { type: String, required: true },
  },
  { _id: false },
);

const applicationSchema = new mongoose.Schema(
  {
    applicant: { type: applicantSchema, required: true },
    dependents: [
      {
        firstName: String,
        lastName: String,
        dateOfBirth: Date,
        relationship: { type: String, enum: ['Spouse', 'Child'] },
        photoUrl: String,
      },
    ],
    payment: {
      status: {
        type: String,
        enum: ['pending', 'verified'],
        default: 'pending',
      },
      transactionRef: { type: String, unique: true, required: true },
      paymentMethod: { type: String, enum: paymentMethods, required: true },
      amount: { type: Number, required: true },
      paidAt: Date,
      verifiedAt: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'processed'],
      default: 'pending',
    },
    applicationScreenshotUrl: { type: String },
    reviewNotes: String,
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: modelNames.coupon },
  },
  { timestamps: true },
);

export default applicationSchema;
