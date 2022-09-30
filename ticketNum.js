module.exports = () => {
  let num = Math.floor(Math.random() * 1000000);
  let alphabet = "abcdefghijklmnopqrstuvwxyz";
  const randomCharacter =
    alphabet[Math.floor(Math.random() * alphabet.length)].toUpperCase();

  let ticketNum = randomCharacter + num;
  return ticketNum;
};
