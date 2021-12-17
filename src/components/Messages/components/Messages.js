/* eslint-disable import/no-anonymous-default-export */
import React, { useContext, useCallback, useEffect, useState } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import '../styles/_messages.scss';
import initialBottyMsg from '../../../common/constants/initialBottyMessage';
import ScrollToBottom, { useScrollToBottom } from 'react-scroll-to-bottom';
const botty = 'botty';
const ME = 'me';
const socket = io(
  config.BOT_SERVER_ENDPOINT,
  { transports: ['websocket', 'polling', 'flashsocket'] }
);

const Messages = () => {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);
  const scrollToBottom = useScrollToBottom();
  const [botTyping, setBotTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{
    message: initialBottyMsg,
    user: botty
  }]);
  
  useEffect(() => {
    socket.on('bot-message', (message) => {
      setMessages([
        ...messages,
        {message, user: botty}
      ]);
      setBotTyping(false);
      scrollToBottom();
    });
  }, [messages]);

  useEffect(()=>{
    socket.on('bot-typing', () => {
      setBotTyping(true);
    });
  }, []);

  const onChangeMessage = (event) => {
    setMessage(event.target.value);
  };

  const sendMessage = useCallback(() => {
    setMessages([...messages, {message, user: ME}]);
    socket.emit('user-message', message);
    setLatestMessage([...messages, {message, user: ME}]);
    setMessage('');
  }, [messages, message]);

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
      {messages.map((msg, index)=>(
            <Message nextMessage={messages[index + 1]} message={msg} botTyping={botTyping} />
          ))}
        {botTyping ? <TypingMessage /> : null}
      </div>
      <Footer message={message} sendMessage={sendMessage} onChangeMessage={onChangeMessage} />
    </div>
  );
}

export default () => (
  <ScrollToBottom>
    <Messages />
  </ScrollToBottom>
);
