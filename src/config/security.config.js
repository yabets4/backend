export default {
  cors: { origin: '*', credentials: true },
  helmet: {}, // add fine-grained policy here
  passwordHashRounds: 10,
};
