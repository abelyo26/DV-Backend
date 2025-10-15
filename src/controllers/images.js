import { unlink } from 'fs/promises';
import { appDomain } from '../config/environments';
import path from 'path';
import { existsSync } from 'fs';

const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct proper URL for the file
    const fileUrl = `${appDomain}/files/${req.file.filename}`;

    return res.status(200).json({
      ...req.file,
      url: fileUrl,
      success: true,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message,
    });
  }
};

const deleteUploadFile = async (req, res) => {
  try {
    const { filename } = req.query;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required',
      });
    }

    const filepath = path.join(__dirname, '../../uploads', filename);
    const isFileExists = existsSync(filepath);

    if (isFileExists) {
      await unlink(filepath);
      return res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message,
    });
  }
};

export { uploadImage, deleteUploadFile };
