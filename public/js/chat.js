const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// server (emit) -> client (receive) --acknowledgement--> server

// client (emit) -> server (receive) --acknowledgement==> client

/*
socket.on('countUpdated', (count) => {
  console.log('The count has been updated!', count);
});
 
document.querySelector('#increment').addEventListener('click', () => {
  console.log('Clicked');
  socket.emit('increment');
});
*/

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // console.log(newMessageStyles);
  // console.log(newMessageMargin);

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    // username
    username: message.username,
    // message
    message: message.text,
    // createdAt: message.createdAt
    createdAt: moment(message.createdAt).format('HH:mm:ss')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

// socket.on('locationMessage', (url) => {
socket.on('locationMessage', (message) => {
  // console.log(url);
  console.log(message);
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    // url
    url: message.url,
    createdAt: moment(message.createdAt).format('HH:mm:ss')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  // console.log(room);
  // console.log(users);
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  document.querySelector('#sidebar').innerHTML = html;
});

// document.querySelector('#message-form').addEventListener('submit', (e) => {
$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled');

  // disable form
  // const message = document.querySelector('input').value;
  const message = e.target.elements.message.value;

  // socket.emit('sendMessage', message);
  // socket.emit('sendMessage', message, (message) => {
  // console.log('The message was delivered!', message);
  socket.emit('sendMessage', message, (error) => {

    // enable form
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }

    console.log('Message delivered!');
  });
});

// document.querySelector('#send-location').addEventListener('click', () => {
$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser!');
  }

  $sendLocationButton.setAttribute('disabled', 'disabled');

  //   navigator.geolocation.getCurrentPosition((position) => {
  //     // console.log(position);
  //     socket.emit('sendLocation', {
  //       latitude: position.coords.latitude,
  //       longitude: position.coords.longitude
  //     });
  //   });

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, () => {
      $sendLocationButton.removeAttribute('disabled');
      console.log('Location shared!');
    });
  });
});

// socket.emit('join', { username, room });
socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});