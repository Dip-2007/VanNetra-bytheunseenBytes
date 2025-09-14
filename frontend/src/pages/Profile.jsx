import React, { useEffect, useState } from "react";

const Profile = ({ user }) => {
  const [selectedAvatar, setSelectedAvatar] = useState("/user.png");

  // Editable profile fields
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [stateName, setStateName] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [caste, setCaste] = useState("");

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (savedAvatar) setSelectedAvatar(savedAvatar);

    if (user) {
      setUsername(user.name || "");
      setMobile(user.mobile || "");
      setStateName(user.state || "");
      setDistrict(user.district || "");
      setVillage(user.village || "");
      setCaste(user.caste || "");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <h2 className="text-xl font-bold text-gray-700">
          Please log in to view your profile.
        </h2>
      </div>
    );
  }

  const handleSaveProfile = () => {
    setEditing(false);

    // Save to localStorage (or you can send PUT request to backend here)
    const updatedUser = {
      ...user,
      name: username,
      mobile,
      state: stateName,
      district,
      village,
      caste,
    };

    localStorage.setItem("userProfile", JSON.stringify(updatedUser));
  };

  return (
    <div className="w-full max-w-md m-auto">
      <div
        className="fixed inset-0 -z-10 bg-[url('back.jpg')] bg-cover bg-no-repeat bg-center"
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-br from-green-600/40 to-blue-600/40"
        aria-hidden="true"
      />
      <div className="w-full max-w-3xl bg-gray-100 backdrop-blur-md shadow-xl rounded-2xl p-8">
        <div className="flex flex-col items-center">
          <img
            src={selectedAvatar}
            alt="User Avatar"
            className="h-28 w-28 rounded-full object-cover border-4 border-green-500 shadow-md"
          />

          {editing ? (
            <div className="mt-4 flex flex-col items-center gap-3 w-full">
              {/* Editable Inputs */}
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400"
                placeholder="Full Name"
              />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400"
                placeholder="Mobile Number"
              />
              <input
                type="text"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400"
                placeholder="State"
              />
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400"
                placeholder="District"
              />
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400"
                placeholder="Village"
              />
              <input
                type="text"
                value={caste}
                onChange={(e) => setCaste(e.target.value)}
                className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-green-400"
                placeholder="Caste"
              />

              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <h2 className="mt-4 text-2xl font-bold text-gray-800">
                {username}
              </h2>
              <button
                onClick={() => setEditing(true)}
                className="mt-2 text-sm text-green-600 hover:underline"
              >
                Edit Profile
              </button>
            </>
          )}

          <p className="text-gray-500">{user.email}</p>
        </div>

        {/* Profile Sections */}
        <div className="mt-8 space-y-4">
          <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-black">
              User Information
            </h3>
            <p className="text-gray-600 mt-2">Name: {username}</p>
            <p className="text-gray-600">Email: {user.email}</p>
            <p className="text-gray-600">Village: {village || "N/A"}</p>
            <p className="text-gray-600">District: {district || "N/A"}</p>
            <p className="text-gray-600">State: {stateName || "N/A"}</p>
            <p className="text-gray-600">Mobile Number: {mobile || "N/A"}</p>
            <p className="text-gray-600">Caste: {caste || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
