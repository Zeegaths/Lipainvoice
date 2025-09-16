/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import { ArrowLeft, User, Camera, Save, Check, AlertCircle, Bitcoin, Bell, Shield, Link as LinkIcon, Star, Award, Eye, EyeOff } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Page } from '../App';

interface FreelancerSettingsProps {
  onNavigate: (page: Page) => void;
}

interface UserProfile {
  displayName: string;
  professionalTitle: string;
  bio: string;
  profilePhoto?: string;
  socialLinks: {
    linkedin: string;
    twitter: string;
    github: string;
    website: string;
  };
  bitcoinAddress: string;
  withdrawalPreferences: {
    autoWithdraw: boolean;
    minimumAmount: number;
    notifyOnPayment: boolean;
  };
  notificationPreferences: {
    badgeMilestones: boolean;
    clientReviews: boolean;
    paymentUpdates: boolean;
    progressUpdates: boolean;
    emailNotifications: boolean;
  };
  privacySettings: {
    profileVisibility: 'public' | 'clients_only' | 'private';
    showEarnings: boolean;
    showBadges: boolean;
    showReviews: boolean;
  };
}

const FreelancerSettings = ({ onNavigate }: FreelancerSettingsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useInternetIdentity();
  
  // Placeholder for saveProfileMutation
  const saveProfileMutation = {
    mutateAsync: async (data: string) => {
      console.log('Saving profile data:', data);
      return Promise.resolve();
    },
    isPending: false
  };
  
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'notifications' | 'privacy'>('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile>({
    displayName: '',
    professionalTitle: '',
    bio: '',
    profilePhoto: undefined,
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: '',
      website: ''
    },
    bitcoinAddress: '',
    withdrawalPreferences: {
      autoWithdraw: false,
      minimumAmount: 0.001,
      notifyOnPayment: true
    },
    notificationPreferences: {
      badgeMilestones: true,
      clientReviews: true,
      paymentUpdates: true,
      progressUpdates: true,
      emailNotifications: false
    },
    privacySettings: {
      profileVisibility: 'public',
      showEarnings: false,
      showBadges: true,
      showReviews: true
    }
  });

  // Load user profile data when available
  React.useEffect(() => {
    if (isAuthenticated) {
      // TODO: Load user profile data from backend when authenticated
      // For now, just use default profile data
    }
  }, [isAuthenticated]);

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        const parentKey = keys[0] as keyof UserProfile;
        const childKey = keys[1];
        const parentValue = prev[parentKey];
        
        if (typeof parentValue === 'object' && parentValue !== null) {
          return {
            ...prev,
            [parentKey]: {
              ...parentValue,
              [childKey]: value
            }
          };
        }
      }
      return prev;
    });
    setHasChanges(true);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleInputChange('profilePhoto', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await saveProfileMutation.mutateAsync(JSON.stringify(profileData));
      setHasChanges(false);
      setShowSaveConfirmation(true);
      setTimeout(() => setShowSaveConfirmation(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const validateBitcoinAddress = (address: string) => {
    // Basic Bitcoin address validation
    const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
    return btcRegex.test(address);
  };

  const validateUrl = (url: string) => {
    if (!url) return true; // Empty URLs are valid
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      profileData.displayName,
      profileData.professionalTitle,
      profileData.bio,
      profileData.profilePhoto,
      profileData.bitcoinAddress,
      profileData.socialLinks.linkedin || profileData.socialLinks.twitter || profileData.socialLinks.github || profileData.socialLinks.website
    ];
    const completedFields = fields.filter(field => field && field.trim()).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Mock reputation data
  const reputationData = {
    averageRating: 4.8,
    totalReviews: 47,
    recentReviews: [
      { client: 'TechCorp', rating: 5, comment: 'Excellent work and communication', date: '2025-01-15' },
      { client: 'StartupXYZ', rating: 5, comment: 'Delivered ahead of schedule', date: '2025-01-10' },
      { client: 'DesignCo', rating: 4, comment: 'Great quality, minor revisions needed', date: '2025-01-05' }
    ]
  };

  // Placeholder badges data
  const badges = [
    { name: 'Gold Tier', description: 'Top performer' },
    { name: 'Silver Tier', description: 'Consistent quality' },
    { name: 'Bronze Tier', description: 'Getting started' }
  ];

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'wallet', name: 'Wallet & Payments', icon: Bitcoin },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield }
  ];

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Please log in to access settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your profile and preferences</p>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saveProfileMutation.isPending}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saveProfileMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Save Confirmation */}
      {showSaveConfirmation && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">Settings saved successfully!</p>
          </div>
        </div>
      )}

      {/* Profile Completion */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Profile Completion</h3>
          <span className="text-sm font-medium text-blue-600">{profileCompletion}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Complete your profile to improve visibility and attract more clients
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Photo
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {profileData.profilePhoto ? (
                      <img
                        src={profileData.profilePhoto}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg"
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Upload a professional photo to help clients recognize you
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG up to 5MB
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={profileData.professionalTitle}
                    onChange={(e) => handleInputChange('professionalTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Full Stack Developer, UI/UX Designer"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Tell clients about your experience, skills, and what makes you unique..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {profileData.bio.length}/500 characters
                </p>
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Social Media Links
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">LinkedIn</label>
                    <input
                      type="url"
                      value={profileData.socialLinks.linkedin}
                      onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Twitter</label>
                    <input
                      type="url"
                      value={profileData.socialLinks.twitter}
                      onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://twitter.com/yourusername"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">GitHub</label>
                    <input
                      type="url"
                      value={profileData.socialLinks.github}
                      onChange={(e) => handleInputChange('socialLinks.github', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Website</label>
                    <input
                      type="url"
                      value={profileData.socialLinks.website}
                      onChange={(e) => handleInputChange('socialLinks.website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>

              {/* Reputation Overview */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Reputation Overview</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="ml-1 text-xl font-bold text-gray-900">{reputationData.averageRating}</span>
                    </div>
                    <p className="text-sm text-gray-600">{reputationData.totalReviews} reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{badges.length}</p>
                    <p className="text-sm text-gray-600">Badges earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">{profileCompletion}%</p>
                    <p className="text-sm text-gray-600">Profile complete</p>
                  </div>
                </div>
                
                {/* Recent Reviews */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Recent Client Reviews</h5>
                  <div className="space-y-3">
                    {reputationData.recentReviews.map((review, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{review.client}</span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(review.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bitcoin Address *
                </label>
                <input
                  type="text"
                  value={profileData.bitcoinAddress}
                  onChange={(e) => handleInputChange('bitcoinAddress', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    profileData.bitcoinAddress && !validateBitcoinAddress(profileData.bitcoinAddress)
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                  placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                  required
                />
                {profileData.bitcoinAddress && !validateBitcoinAddress(profileData.bitcoinAddress) && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Please enter a valid Bitcoin address
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  This address will be used for receiving payments from invoices
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Withdrawal Preferences</h4>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.withdrawalPreferences.autoWithdraw}
                      onChange={(e) => handleInputChange('withdrawalPreferences.autoWithdraw', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable automatic withdrawals</span>
                  </label>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum withdrawal amount (BTC)
                    </label>
                    <input
                      type="number"
                      step="0.00000001"
                      value={profileData.withdrawalPreferences.minimumAmount}
                      onChange={(e) => handleInputChange('withdrawalPreferences.minimumAmount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0.00000001"
                    />
                  </div>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profileData.withdrawalPreferences.notifyOnPayment}
                      onChange={(e) => handleInputChange('withdrawalPreferences.notifyOnPayment', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Notify me when payments are received</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Notification Preferences</h4>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Badge Milestones</span>
                      <p className="text-xs text-gray-600">Get notified when you achieve new badge tiers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profileData.notificationPreferences.badgeMilestones}
                      onChange={(e) => handleInputChange('notificationPreferences.badgeMilestones', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Client Reviews</span>
                      <p className="text-xs text-gray-600">Get notified when clients leave reviews</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profileData.notificationPreferences.clientReviews}
                      onChange={(e) => handleInputChange('notificationPreferences.clientReviews', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Payment Updates</span>
                      <p className="text-xs text-gray-600">Get notified about invoice payments and distributions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profileData.notificationPreferences.paymentUpdates}
                      onChange={(e) => handleInputChange('notificationPreferences.paymentUpdates', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Progress Updates</span>
                      <p className="text-xs text-gray-600">Get notified about your progress toward next badge tier</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profileData.notificationPreferences.progressUpdates}
                      onChange={(e) => handleInputChange('notificationPreferences.progressUpdates', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                      <p className="text-xs text-gray-600">Receive notifications via email (coming soon)</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profileData.notificationPreferences.emailNotifications}
                      onChange={(e) => handleInputChange('notificationPreferences.emailNotifications', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Profile Visibility</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Who can see your profile?
                    </label>
                    <select
                      value={profileData.privacySettings.profileVisibility}
                      onChange={(e) => handleInputChange('privacySettings.profileVisibility', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="public">Public - Anyone can view</option>
                      <option value="clients_only">Clients Only - Only clients with invoice links</option>
                      <option value="private">Private - Hidden from public view</option>
                    </select>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Show Earnings</span>
                        <p className="text-xs text-gray-600">Display your total earnings on your profile</p>
                      </div>
                      <div className="flex items-center">
                        {profileData.privacySettings.showEarnings ? (
                          <Eye className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        <input
                          type="checkbox"
                          checked={profileData.privacySettings.showEarnings}
                          onChange={(e) => handleInputChange('privacySettings.showEarnings', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Show Badges</span>
                        <p className="text-xs text-gray-600">Display your achievement badges on your profile</p>
                      </div>
                      <div className="flex items-center">
                        {profileData.privacySettings.showBadges ? (
                          <Eye className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        <input
                          type="checkbox"
                          checked={profileData.privacySettings.showBadges}
                          onChange={(e) => handleInputChange('privacySettings.showBadges', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Show Reviews</span>
                        <p className="text-xs text-gray-600">Display client reviews on your profile</p>
                      </div>
                      <div className="flex items-center">
                        {profileData.privacySettings.showReviews ? (
                          <Eye className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        <input
                          type="checkbox"
                          checked={profileData.privacySettings.showReviews}
                          onChange={(e) => handleInputChange('privacySettings.showReviews', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h5 className="font-medium text-blue-900">Data Security</h5>
                    <p className="text-sm text-blue-700 mt-1">
                      All your data is securely stored on the Internet Computer blockchain. 
                      Your profile information is encrypted and only accessible with your Internet Identity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerSettings;
