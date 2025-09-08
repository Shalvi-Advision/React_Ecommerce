// Authentication API service functions
const API_BASE_URL = 'https://fakestoreapi.com'; // Using Fake Store API for demo purposes

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

export const getCurrentUser = async (token) => {
  try {
    // In a real app, this would validate the token with the server
    // For demo purposes, we'll return mock user data
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      name: 'John Doe',
      role: 'customer'
    };

    return mockUser;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    // In a real app, this would invalidate the token on the server
    // For demo purposes, we'll just return success
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};
