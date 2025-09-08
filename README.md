# React E-Commerce Application

A comprehensive React.js e-commerce application built with a feature-based architecture, Tailwind CSS, and modern best practices.

## 🚀 Features

- **Product Listing**: Browse products with search and filtering capabilities
- **Product Details**: Detailed product pages with quantity selection
- **Shopping Cart**: Add, remove, and update cart items with persistence
- **User Authentication**: Login and registration functionality
- **Checkout Process**: Multi-step checkout with order summary
- **Responsive Design**: Mobile-first design that works on all devices
- **Feature-Based Architecture**: Organized code structure for scalability

## 🛠️ Technology Stack

- **React.js** (with hooks and functional components)
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Context API** for state management
- **Fake Store API** for demo data

## 📁 Project Structure

```
src/
├── api/                    # API service functions
│   ├── productsApi.js     # Product-related API calls
│   └── authApi.js         # Authentication API calls
├── assets/                # Static assets (images, icons, etc.)
├── components/            # Reusable UI components
│   ├── Button.js
│   ├── Card.js
│   ├── Input.js
│   ├── Modal.js
│   ├── Loading.js
│   ├── Header.js
│   └── Footer.js
├── context/               # React Context providers
│   ├── AuthContext.js    # Authentication state
│   └── CartContext.js    # Shopping cart state
├── features/             # Feature-specific code (future expansion)
├── hooks/                # Custom React hooks
│   └── useFetch.js      # Data fetching hook
├── pages/                # Page components
│   ├── HomePage.js      # Product listing and search
│   ├── ProductDetailsPage.js
│   ├── CartPage.js
│   ├── LoginPage.js
│   ├── RegisterPage.js
│   ├── CheckoutPage.js
│   └── NotFoundPage.js
├── App.js               # Main application component
└── index.js            # Application entry point
```

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Tailwind CSS

The application uses Tailwind CSS for styling. Custom configurations can be found in:
- `tailwind.config.js` - Tailwind configuration
- `src/index.css` - Global styles and custom components

### API Integration

The application currently uses the [Fake Store API](https://fakestoreapi.com/) for demo purposes. To integrate with a real API:

1. Update the API endpoints in `src/api/` files
2. Modify the API functions to match your backend structure
3. Update authentication logic if needed

## 🎯 Key Features Explained

### Feature-Based Architecture

The application follows a feature-based architecture where related code is organized together:

- **Components**: Reusable UI elements in `src/components/`
- **Features**: Feature-specific logic (expandable for future features)
- **Context**: Global state management
- **API**: External data integration
- **Hooks**: Custom logic and data fetching

### State Management

- **Cart State**: Managed with React Context, persisted in localStorage
- **Auth State**: User authentication state with token management
- **Component State**: Local state for forms and UI interactions

### Responsive Design

- Mobile-first approach with Tailwind CSS
- Flexible grid layouts that adapt to screen sizes
- Touch-friendly interactions for mobile devices

## 🧪 Testing the Application

### Demo Credentials
- **Username**: any value
- **Password**: any value
- **Email**: any valid email format

### Sample Usage Flow

1. **Browse Products**: View the product catalog on the homepage
2. **Search/Filter**: Use the search bar or category filters
3. **Product Details**: Click on any product to view details
4. **Add to Cart**: Use the quantity selector and "Add to Cart" button
5. **View Cart**: Check cart contents and update quantities
6. **Authentication**: Register or login (demo credentials work)
7. **Checkout**: Complete the multi-step checkout process

## 🔄 API Endpoints Used

- `GET /products` - Fetch all products
- `GET /products/{id}` - Fetch single product
- `GET /products/categories` - Fetch product categories
- `POST /auth/login` - User authentication
- `POST /users` - User registration

## 🚀 Building for Production

```bash
npm run build
# or
yarn build
```

This creates an optimized production build in the `build` folder.

## 📱 Mobile Responsiveness

The application is fully responsive and works seamlessly across:
- Mobile phones (320px and up)
- Tablets (768px and up)
- Desktop computers (1024px and up)

## 🔒 Security Considerations

- Input validation on all forms
- Secure token storage in localStorage
- Error handling for API failures
- CSRF protection (when connected to real API)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the browser console for error messages
2. Ensure all dependencies are installed correctly
3. Verify your Node.js version meets the requirements

## 🎉 Acknowledgments

- [Fake Store API](https://fakestoreapi.com/) for demo data
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React](https://reactjs.org/) for the framework
- [Heroicons](https://heroicons.com/) for icons

---

**Happy Shopping! 🛒**
