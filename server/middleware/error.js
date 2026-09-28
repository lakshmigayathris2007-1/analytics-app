export const notFound = (req, res) => res.status(404).json({ message: 'Route not found' });
export const errorHandler = (err, req, res, next) => {
  console.error(err);
  let status = err.status || 500, message = err.message || 'Server error';
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  if (err.code === 11000) { status = 409; message = 'Email already registered'; }
  res.status(status).json({ message });
};
