interface greetingProp {
  username: string;
}
export const GreetingMessage = ({ username }: greetingProp) => {
  const currentHour = new Date().getHours();

  let msg;

  if (currentHour >= 4 && currentHour < 12) {
    msg = `Good Morning ${username} !`;
  } else if (currentHour >= 12 && currentHour < 17) {
    msg = `Good Afternoon ${username} !`;
  } else if (currentHour >= 17 && currentHour < 20) {
    msg = `Good Evening ${username} !`;
  } else {
    msg = `Great to see you here!  ${username}`;
  }

  return msg;
};
