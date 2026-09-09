import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { useSound } from '../context/SoundContext';

const GlobalSocketListeners: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const { addToast } = useToast();
  const { playNotification } = useSound();

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('friend_request', (data: any) => {
      playNotification();
      addToast(`RECRUITMENT SIGNAL: ${data.sender?.name} wishes to team up.`, 'info');
    });

    socket.on('friend_request_accepted', (data: any) => {
      playNotification();
      addToast(`ACCESS GRANTED: ${data.name} has accepted your team request!`, 'success');
    });

    socket.on('message_notification', (data: any) => {
      // If we are not currently on the chat page, show notification
      if (!window.location.pathname.includes('/chat')) {
        playNotification();
        addToast(`INCOMING TRANSMISSION from ${data.message.sender?.name}`, 'info');
      }
    });

    return () => {
      socket.off('friend_request');
      socket.off('friend_request_accepted');
      socket.off('message_notification');
    };
  }, [socket, isConnected, addToast, playNotification]);

  return null; // Invisible component
};

export default GlobalSocketListeners;
