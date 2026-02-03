module.exports = {
	api_url: false ? process.env.REACT_APP_API_URL_LOCAL : process.env.REACT_APP_API_URL,
	front_url: false ? process.env.REACT_APP_REDIRECT_FRONTEND_LOCAL : process.env.REACT_APP_REDIRECT_FRONTEND
};