//console.log('Hello from -> Popup');
const handleSwitchVersion = (version) => {
  document.querySelectorAll('.switch-version-btn').forEach((i) => i.setAttribute('class', 'switch-version-btn'));
  if (version === '0.1.8') {
    localStorage.setItem('resources-saver-version', '0.1.8');
    return document.getElementById('switch-version-1-8').setAttribute('class', 'switch-version-btn active');
  }
  if (version === '0.1.9') {
    localStorage.setItem('resources-saver-version', '0.1.9');
    return document.getElementById('switch-version-1-9').setAttribute('class', 'switch-version-btn active');
  }
  if (version === '2') {
    localStorage.setItem('resources-saver-version', '2');
    return document.getElementById('switch-version-2').setAttribute('class', 'switch-version-btn active');
  }
};

window.onload = () => {
  document.getElementById('switch-version-1-8').addEventListener('click', () => {
    handleSwitchVersion('0.1.8');
  });

  document.getElementById('switch-version-1-9').addEventListener('click', () => {
    handleSwitchVersion('0.1.9');
  });

  document.getElementById('switch-version-2').addEventListener('click', () => {
    handleSwitchVersion('2');
  });

  const version = localStorage.getItem('resources-saver-version');

  if (version === '2') {
    return document.getElementById('switch-version-2').setAttribute('class', 'switch-version-btn active');
  }

  if (version === '0.1.9') {
    return document.getElementById('switch-version-1-9').setAttribute('class', 'switch-version-btn active');
  }

  return document.getElementById('switch-version-1-8').setAttribute('class', 'switch-version-btn active');
};
