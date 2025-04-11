"use strict";
const adjectives = [
    'Cool', 'Super', 'Mega', 'Ultra', 'Epic', 'Awesome', 'Amazing',
    'Brilliant', 'Clever', 'Daring', 'Eager', 'Fierce', 'Gentle'
];
const nouns = [
    'Tiger', 'Eagle', 'Dolphin', 'Panda', 'Koala', 'Penguin', 'Lion',
    'Wolf', 'Bear', 'Fox', 'Hawk', 'Owl', 'Dragon', 'Phoenix'
];
const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
];
function generateRandomName() {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 100);
    return `${adjective}${noun}${number}`;
}
function generateRandomAvatar() {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 40;
    const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${color}"/>
      <circle cx="${size / 2}" cy="${size / 3}" r="${size / 6}" fill="white"/>
      <path d="M ${size / 4} ${size * 2 / 3} Q ${size / 2} ${size * 4 / 5} ${size * 3 / 4} ${size * 2 / 3}" stroke="white" fill="none" stroke-width="2"/>
    </svg>
  `;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
module.exports = {
    generateRandomName,
    generateRandomAvatar
};
