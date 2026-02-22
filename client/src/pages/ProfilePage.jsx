import React from 'react';
import Profile from '../components/Customer/Profile';

// Simple wrapper page so Profile has its own route
const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-purple-800 mb-4">My Profile</h1>
        <Profile />
      </div>
    </div>
  );
};

export default ProfilePage;
