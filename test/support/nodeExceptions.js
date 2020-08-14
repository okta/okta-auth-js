// Catch unhandled promise rejections. These should never happen.
// If you see one of these, debug the test and set a breakpoint below.
process.on('unhandledRejection', error => {
  console.log('FLAKEY TEST or CODE! unhandledRejection', error);
});