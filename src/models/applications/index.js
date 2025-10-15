import mongoose from 'mongoose';

import applicationSchema from './schema';

const Applications = mongoose.model('Applications', applicationSchema);

export default Applications;
