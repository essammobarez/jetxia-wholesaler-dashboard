'use client';
import React, { useState, useEffect, FC, ElementType, ChangeEvent, FormEvent, useRef } from 'react';
import {
  User,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Home,
  Briefcase,
  Smartphone,
  AtSign,
  Edit,
  X,
  Check,
  AlertCircle,
  Loader2,
  Camera,
  UploadCloud,
} from 'lucide-react';

// --- TYPE DEFINITIONS & INTERFACES ---

type ProfileSection = 'company' | 'personal';

interface ProfileData {
  wholesalerName: string;
  country: string;
  city: string;
  address: string;
  website: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  emailId: string;
  designation: string;
  mobileNumber: string;
  logo: string | null; // Added for profile image
}

interface InfoRowProps {
  icon: ElementType;
  label: string;
  value: string | null;
  iconColorClass?: string;
}

interface EditModalProps {
  section: ProfileSection;
  initialData: ProfileData;
  onClose: () => void;
  onSave: (updatedData: Partial<ProfileData>) => Promise<void>;
}

// Added for the new Image Upload Modal
interface ImageUploadModalProps {
  onClose: () => void;
  onSave: (base64Image: string) => Promise<void>;
}

interface FormInputProps {
    id: keyof ProfileData;
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
}

// --- REUSABLE UI COMPONENTS ---

/**
 * A single row for displaying a piece of profile information.
 */
const InfoRow: FC<InfoRowProps> = ({ icon: Icon, label, value, iconColorClass = "text-slate-500" }) => (
  <div className="flex items-center space-x-4 py-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700/50 rounded-lg">
      <Icon className={`w-5 h-5 ${iconColorClass}`} />
    </div>
    <div className="flex-1">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-base font-medium text-slate-800 dark:text-slate-100 truncate">
        {value || <span className="text-slate-400 dark:text-slate-500">Not provided</span>}
      </p>
    </div>
  </div>
);

/**
 * A styled input field for the edit modal form.
 */
const FormInput: FC<FormInputProps> = ({ id, label, value, onChange, type = 'text', required = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            {label}
        </label>
        <input
            id={id}
            name={id}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
        />
    </div>
);


/**
 * Skeleton loader for the initial data fetch.
 */
const ProfileSkeletonLoader: FC = () => (
    <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center space-x-6 mb-8">
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="space-y-3">
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                    <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                </div>
            </div>
            {/* Tabs Skeleton */}
            <div className="flex items-center border-b border-slate-200 dark:border-slate-700 mb-6">
                 <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-t-lg mr-2"></div>
                 <div className="h-10 w-32 bg-slate-200/50 dark:bg-slate-700/50 rounded-t-lg"></div>
            </div>
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-4">
                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                            <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);


// --- EDIT MODAL COMPONENT ---
const EditProfileModal: FC<EditModalProps> = ({ section, initialData, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Populate form data based on the section being edited
    const fieldsToEdit = section === 'company'
      ? { wholesalerName: initialData.wholesalerName, address: initialData.address, website: initialData.website, phoneNumber: initialData.phoneNumber }
      : { firstName: initialData.firstName, lastName: initialData.lastName, userName: initialData.userName, designation: initialData.designation, mobileNumber: initialData.mobileNumber };
    setFormData(fieldsToEdit);
  }, [section, initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData);
    // The parent component will handle closing the modal on success
    setIsSubmitting(false);
  };

  const companyFields: (keyof ProfileData)[] = ['wholesalerName', 'website', 'phoneNumber', 'address'];
  const personalFields: (keyof ProfileData)[] = ['firstName', 'lastName', 'userName', 'designation', 'mobileNumber'];
  const fieldLabels: Record<keyof ProfileData, string> = {
      wholesalerName: 'Company Name',
      website: 'Website',
      phoneNumber: 'Phone Number',
      address: 'Address',
      firstName: 'First Name',
      lastName: 'Last Name',
      userName: 'Username',
      designation: 'Designation',
      mobileNumber: 'Mobile Number',
      logo: 'Logo', // Added to satisfy TS
      // other fields not in forms
      city: '', country: '', email: '', emailId: ''
  };

  const renderFormFields = () => {
    const fields = section === 'company' ? companyFields : personalFields;
    const gridCols = section === 'company' ? 'md:grid-cols-1' : 'md:grid-cols-2';
    
    return (
        <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
            {fields.map(field => (
                <FormInput
                    key={field}
                    id={field}
                    label={fieldLabels[field]}
                    value={(formData as any)[field] || ''}
                    onChange={handleChange}
                    required={['wholesalerName', 'firstName', 'lastName', 'userName', 'mobileNumber'].includes(field)}
                />
            ))}
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all duration-300 scale-95 animate-scale-in">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Edit {section.charAt(0).toUpperCase() + section.slice(1)} Information
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {renderFormFields()}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg flex items-center justify-center bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- NEW IMAGE UPLOAD MODAL COMPONENT ---
const ImageUploadModal: FC<ImageUploadModalProps> = ({ onClose, onSave }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError("File is too large. Please select an image under 2MB.");
        setPreview(null);
        setBase64Image(null);
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setBase64Image(result); // This is the base64 string
      };
      reader.onerror = () => {
        setError("Failed to read the file.");
      };
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!base64Image) {
      setError("Please select an image to upload.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    await onSave(base64Image);
    // Parent component will handle closing on success
    setIsSubmitting(false);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all duration-300 scale-95 animate-scale-in">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Upload Profile Image
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif"
            className="hidden"
          />

          {preview ? (
            <div className="mb-4 text-center">
              {/* --- FIXED IMAGE PREVIEW --- */}
              <div className="w-40 h-40 rounded-full mx-auto mb-3 border-4 border-slate-200 dark:border-slate-700 overflow-hidden">
                <img 
                  src={preview} 
                  alt="Image preview" 
                  className="w-full h-full object-cover" 
                />
              </div>
              {/* --- END FIX --- */}
              <button
                type="button"
                onClick={triggerFileSelect}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Change image
              </button>
            </div>
          ) : (
            <div
              onClick={triggerFileSelect}
              className="mb-4 w-full h-48 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <UploadCloud className="w-10 h-10 mb-2" />
              <span className="font-medium">Click to upload</span>
              <span className="text-sm">PNG, JPG, or GIF (max 2MB)</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center mb-4">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !base64Image}
              className="px-5 py-2.5 rounded-lg flex items-center justify-center bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : 'Save Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---
function ProfileSettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<ProfileSection | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // State for new modal
  const [activeTab, setActiveTab] = useState<ProfileSection>('company');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchProfile = async () => {
    if (!loading) setLoading(true);
    setError(null);
    try {
      const token = document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1] || localStorage.getItem("authToken");
      if (!token) throw new Error("Authorization failed. Please log in again.");

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wholesaler/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to fetch profile data.');

      setProfile(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (updatedData: Partial<ProfileData>) => {
    setNotification(null);
    try {
      const token = document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1] || localStorage.getItem("authToken");
      if (!token) throw new Error("Authorization token not found.");

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wholesaler/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Failed to update profile.");

      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      setEditingSection(null);
      setNotification({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err: any) {
      setNotification({ message: err.message, type: 'error' });
    }
  };

  // --- New handler for saving the profile image ---
  const handleImageSave = async (base64Image: string) => {
    setNotification(null);
    const payload = { logo: base64Image };

    try {
      const token = document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1] || localStorage.getItem("authToken");
      if (!token) throw new Error("Authorization token not found.");

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/wholesaler/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || "Failed to update profile image.");

      // Optimistically update the profile state with the new image
      setProfile(prev => prev ? { ...prev, logo: base64Image } : null);
      setIsImageModalOpen(false);
      setNotification({ message: 'Profile image updated!', type: 'success' });
    } catch (err: any) {
      setNotification({ message: err.message, type: 'error' });
    }
  };


  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (loading) return <ProfileSkeletonLoader />;
  
  if (error) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-lg font-medium text-red-600 dark:text-red-400">An error occurred</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
            <button onClick={() => fetchProfile()} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Try Again
            </button>
        </div>
    </div>
  );

  if (!profile) return null;

  const avatarSrc = profile.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.firstName} ${profile.lastName}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 text-white max-w-md transition-all duration-300 animate-fade-slide
          ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}
        `}>
          {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* <header className="text-left mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white">
              My Profile
            </h1>
          </header> */}

          <main className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50 overflow-hidden">
            {/* Profile Header */}
            <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                
                {/* --- MODIFIED IMAGE SECTION --- */}
                <div className="relative group flex-shrink-0">
                  {/* --- FIXED AVATAR --- */}
                  <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-700 shadow-md overflow-hidden">
                    <img 
                      src={avatarSrc} 
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* --- END FIX --- */}
                  <button
                    onClick={() => setIsImageModalOpen(true)}
                    className="absolute inset-0 w-full h-full bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
                {/* --- END MODIFIED IMAGE SECTION --- */}

                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{`${profile.firstName} ${profile.lastName}`}</h2>
                  <p className="text-md text-slate-500 dark:text-slate-400">{profile.designation}</p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-6 md:px-8">
              <TabButton
                label="Company"
                icon={Building}
                isActive={activeTab === 'company'}
                onClick={() => setActiveTab('company')}
              />
              <TabButton
                label="Personal"
                icon={User}
                isActive={activeTab === 'personal'}
                onClick={() => setActiveTab('personal')}
              />
              <div className="flex-grow"></div>
              <button
                onClick={() => setEditingSection(activeTab)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 my-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
              >
                <Edit className="w-4 h-4" /> Edit Details
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="p-6 md:p-8">
              {activeTab === 'company' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <InfoRow icon={Building} label="Company Name" value={profile.wholesalerName} iconColorClass="text-blue-500"/>
                  <InfoRow icon={Mail} label="Company Email" value={profile.email} iconColorClass="text-red-500"/>
                  <InfoRow icon={Globe} label="Website" value={profile.website} iconColorClass="text-green-500"/>
                  <InfoRow icon={Phone} label="Phone" value={profile.phoneNumber} iconColorClass="text-purple-500"/>
                  <InfoRow icon={MapPin} label="Location" value={`${profile.city}, ${profile.country}`} iconColorClass="text-orange-500"/>
                  <InfoRow icon={Home} label="Address" value={profile.address} iconColorClass="text-teal-500"/>
                </div>
              )}
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <InfoRow icon={User} label="Full Name" value={`${profile.firstName} ${profile.lastName}`} iconColorClass="text-blue-500"/>
                  <InfoRow icon={AtSign} label="Username" value={profile.userName} iconColorClass="text-sky-500"/>
                  <InfoRow icon={Mail} label="Personal Email" value={profile.emailId} iconColorClass="text-red-500"/>
                  <InfoRow icon={Briefcase} label="Designation" value={profile.designation} iconColorClass="text-indigo-500"/>
                  <InfoRow icon={Smartphone} label="Mobile" value={profile.mobileNumber} iconColorClass="text-green-500"/>
                </div>
              )}
               <button
                onClick={() => setEditingSection(activeTab)}
                className="sm:hidden w-full mt-8 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
              >
                <Edit className="w-4 h-4" /> Edit Details
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <EditProfileModal
          section={editingSection}
          initialData={profile}
          onClose={() => setEditingSection(null)}
          onSave={handleSave}
        />
      )}

      {/* --- NEW IMAGE MODAL RENDER --- */}
      {isImageModalOpen && (
        <ImageUploadModal
          onClose={() => setIsImageModalOpen(false)}
          onSave={handleImageSave}
        />
      )}
    </div>
  );
}

// --- HELPER COMPONENTS ---

interface TabButtonProps {
    label: string;
    icon: ElementType;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: FC<TabButtonProps> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-all duration-300
        ${isActive
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
    >
        <Icon className="w-5 h-5" />
        <span className="hidden sm:inline">{label}</span>
    </button>
);

// Add keyframes to your global CSS or a style tag for the animations
const GlobalStyles = () => (
    <style jsx global>{`
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scale-in {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes fade-slide {
        from { transform: translateY(-20px) translateX(-50%); opacity: 0; }
        to { transform: translateY(0) translateX(-50%); opacity: 1; }
      }
      .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
      .animate-fade-slide { animation: fade-slide 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
    `}</style>
);

// It's good practice to include the styles component in your main app layout.
// For this self-contained example, we can add it to the main page component.
// Note: In a real Next.js app, you'd put this in _app.tsx or a layout component.
export default function PageWithStyles() {
    return (
        <>
            <GlobalStyles />
            <ProfileSettingsPage />
        </>
    );
}