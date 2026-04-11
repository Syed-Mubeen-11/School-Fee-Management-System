import api from './api';

// Get all notifications for current user
export const getNotifications = async () => {
  try {
    // Get data needed for notifications
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    const notifications = [];
    
    if (user?.role === 'ADMIN') {
      // Admin notifications
      const studentsRes = await api.get('/students');
      const students = studentsRes.data || [];
      
      // Check for new students today
      const today = new Date().toISOString().split('T')[0];
      const defaultersRes = await api.get('/payments/defaulters');
      const defaulters = defaultersRes.data || [];
      
      notifications.push({
        id: 1,
        title: 'Total Students',
        message: `${students.length} students enrolled in the school`,
        type: 'info',
        time: 'Just now',
        read: false,
        icon: '👨‍🎓'
      });
      
      if (defaulters.length > 0) {
        notifications.push({
          id: 2,
          title: 'Fee Defaulters Alert',
          message: `${defaulters.length} students have pending fee payments`,
          type: 'warning',
          time: 'Just now',
          read: false,
          icon: '⚠️'
        });
      }
      
      // Check low collection today
      const todayCollection = await api.get(`/payments/collection/daily?date=${today}`);
      if (todayCollection.data?.totalCollection < 10000) {
        notifications.push({
          id: 3,
          title: 'Low Collection Alert',
          message: `Today's collection is ₹${todayCollection.data?.totalCollection || 0}. Below target.`,
          type: 'warning',
          time: 'Just now',
          read: false,
          icon: '📉'
        });
      }
      
    } else if (user?.role === 'ACCOUNTANT') {
      // Accountant notifications
      const today = new Date().toISOString().split('T')[0];
      const todayCollection = await api.get(`/payments/collection/daily?date=${today}`);
      
      notifications.push({
        id: 1,
        title: 'Today\'s Collection',
        message: `₹${todayCollection.data?.totalCollection || 0} collected today`,
        type: 'success',
        time: 'Just now',
        read: false,
        icon: '💰'
      });
      
    } else if (user?.role === 'PARENT') {
      // Parent notifications - get their child's pending fees
      const studentsRes = await api.get('/students');
      const students = studentsRes.data || [];
      const child = students.find(s => s.parentEmail === user.email);
      
      if (child) {
        const pendingRes = await api.get(`/students/${child.id}/pending-fee`);
        const pending = pendingRes.data?.pendingFee || 0;
        
        if (pending > 0) {
          notifications.push({
            id: 1,
            title: 'Fee Payment Reminder',
            message: `Pending fee for ${child.name}: ₹${pending.toLocaleString()}`,
            type: 'warning',
            time: 'Just now',
            read: false,
            icon: '📚'
          });
        } else {
          notifications.push({
            id: 1,
            title: 'All Fees Paid',
            message: `Great! All fees for ${child.name} are up to date.`,
            type: 'success',
            time: 'Just now',
            read: false,
            icon: '✅'
          });
        }
      }
    }
    
    return notifications;
  } catch (error) {
    console.error('Notification error:', error);
    return [];
  }
};

// Mark notification as read
export const markAsRead = (notificationId, notifications) => {
  const updated = notifications.map(notif => 
    notif.id === notificationId ? { ...notif, read: true } : notif
  );
  localStorage.setItem('notifications', JSON.stringify(updated));
  return updated;
};

// Mark all as read
export const markAllAsRead = (notifications) => {
  const updated = notifications.map(notif => ({ ...notif, read: true }));
  localStorage.setItem('notifications', JSON.stringify(updated));
  return updated;
};