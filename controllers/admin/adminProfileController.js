const User = require('../../models/userSchema');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcrypt');

const getAdminProfile = async (req, res) => {
  try {
    
    res.render('admin/profile', {
      layout: 'layouts/admin-layout',
      currentPage: 'profile',
      title: 'Admin Profile',
      user: res.locals.user,
    });
    
  } catch (err) {
    console.error('ADMIN PROFILE ERROR:', err);

    return res.status(500).render('error', {
      layout: false,
      status: 500,
      title: 'Server Error',
      message: 'Something went wrong while loading your profile.'
    });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    
    const name = req.body.name?.trim();

    if (!name || name. length < 2 || name.length > 50) {
      return res.status(400).send('Name must be between 2 and 50 characters')
    }

    const userId = req.user.userId || req.user._id;

    const admin = await User.findById(userId);

    if (!admin || admin.role !== 'admin') {
      return res.status(403).send('Admin access required');
    }

    admin.name = name;
    await admin.save();

    return res.redirect('/admin/profile');

  } catch (err) {
    console.error('ADMIN PROFILE UPDATE ERROR:', err);

    return res.status(500).send('Unable to update admin profile.');
  }
};

const changeAdminPassword = async (req, res) => {

  try {
    
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // validate the submitted fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).send('Please fill in all password fields');
    }

    if (newPassword.length < 8) {
      return res.status(400).send('The new password must be at least 8 characters long');
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).send('The new passwords do not match');
    }

    const userId = req.user.userId || req.user._id;
    const admin = await User.findById(userId);

    if (!admin || admin.role !== 'admin') {
      return res.status(403).send('Admin access required');
    }

    //goole accounts may not have a local password
    if (!admin.password) {
      return res.status(400).send('Tehis account does not have a password.');
    }

    //verify the current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, admin.password);

    if (!isPasswordCorrect) {
      return res.status(400).send('Your current password is incorrect');
    }

    //prevent chaning to the same password
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);

    if (isSamePassword) {
      return res.status(400).send('Your new password must ne different from your current password');
    }

    // has and save the new password
    admin.password = await bcrypt.hash(newPassword, 10);

    //used by the existing authentication middleware
    // to invalidate older JWTs
    admin.passwordChangedAt = new Date();

    await admin.save();

    // end this browesr's current login sesstion
    res.clearCookie('token');

    return res.redirect('/users/login?message=password-changed');

  } catch (err) {
    console.error('ADMIN PASSWORD CHANGE ERROR:', err);

    return res.status(500).send('Unable to change your password.');
  }
};

const uploadAdminProfilePicture = async (req, res) => {
  let newFilePath;

  try {
    
    if (!req.file) {
      return res.status(400).send('Please select a profile picture');
    }

    const userId = req.user.userId || req.user._id;

    const admin = await User.findById(userId);

    if (!admin || admin.role !== 'admin') {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(403).send('Admin access required');
    }

    // Remember the previous custom picture.
    const oldProfilePicture = admin.profilePicture;

    const newProfilePicture = `/uploads/profiles/${req.file.filename}`;
    newFilePath = req.file.path;

    admin.profilePicture = newProfilePicture;
    await admin.save();

    // delete the old image only if it is inside our profile-upload folder
    if(
      oldProfilePicture &&
      oldProfilePicture.startsWith('/uploads/profiles/')
    ) {
      const oldFileName = path.basename(oldProfilePicture);
      const oldFilePath = path.join(__dirname, '../../public/uploads/profiles', oldFileName);

      //avoid trying to delete the file we just uploaded
      if (oldFileName !== req.file.filename) {
        await fs.unlink(oldFilePath).catch((err) => {
          if (err.code !== 'ENOENT') {
            console.error('OLD PROFILE PICTURE CLEANUP ERROR:', err);
          }
        });
      }
    }

    return res.redirect('/admin/profile');

  } catch (err) {
    console.error('ADMIN PROFILE PICTURE UPLOAD ERROR:', err);

    //remove the new upload if saving failed
    //only remove it if it is still the current request's file
    if (req.file?.path && newFilePath !== undefined) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return res.status(500).send('Unable to upload your profile picture.');
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  uploadAdminProfilePicture
}