# New Customer Onboarding System

## Overview

The New Customer Onboarding System is a comprehensive flow that allows new SLT customers to register, check infrastructure availability in their area, and request services that may not be currently available.

## Features

### 1. Customer Registration Form
- **Personal Information**: First name, last name, email, phone number
- **Address Information**: Street address, city, district, province, postal code
- **Sri Lanka Districts & Provinces**: Pre-populated dropdowns with all official districts and provinces

### 2. Infrastructure Availability Check
- **Automatic Check**: System automatically checks infrastructure availability based on district/province
- **Service Types**: Fiber, ADSL, and Mobile (4G LTE) availability
- **Real-time Data**: Integrates with existing Area Management system in Admin Dashboard

### 3. Service Options & Requests
- **Available Services**: Customers can subscribe to services available in their area
- **Service Requests**: Customers can request services not currently available
- **Integration**: Service requests appear in Qualification Records area for admin review

## Technical Implementation

### Frontend Components

#### NewCustomerOnboarding.tsx
- **Location**: `Admin frontend/client/pages/NewCustomerOnboarding.tsx`
- **Features**: Multi-step form with infrastructure checking
- **States**: 
  - `details`: Customer information collection
  - `infrastructure`: Infrastructure availability display
  - `services`: Service selection and requests

### Backend API

#### User Management
- **Model**: `ProdigyHub-Unified/src/models/AllTMFModels.js` (UserSchema)
- **Controller**: `ProdigyHub-Unified/src/api/users/controllers/userController.js`
- **Routes**: `ProdigyHub-Unified/src/api/users/routes/userRoutes.js`
- **Endpoints**:
  - `POST /api/users` - Create new user
  - `GET /api/users` - List all users
  - `GET /api/users/:id` - Get user by ID
  - `PUT /api/users/:id` - Update user
  - `DELETE /api/users/:id` - Delete user
  - `GET /api/users/stats` - User statistics

#### Infrastructure Integration
- **Area Management**: Uses existing `/api/areaManagement/v5/area` endpoint
- **Qualification**: Integrates with `/api/productOfferingQualification/v5/checkProductOfferingQualification`

### Data Flow

1. **User Registration**: Customer fills out form with personal and address details
2. **Infrastructure Check**: System queries Area Management API for district/province match
3. **Availability Display**: Shows available services (Fiber, ADSL, Mobile)
4. **Service Selection**: Customer can subscribe to available services
5. **Service Requests**: For unavailable services, creates qualification requests
6. **Data Storage**: User data saved to MongoDB, requests appear in admin dashboard

## Integration Points

### 1. Admin Dashboard - Product Qualification
- **Qualification Records**: Service requests appear here for admin review
- **Area Management**: Infrastructure data used for availability checks
- **Customer Management**: New customer data accessible through user management

### 2. Existing SLT Systems
- **TMF679**: Product Offering Qualification API
- **Area Management**: District/province infrastructure mapping
- **User Management**: Customer profile storage and management

## Usage Instructions

### For Customers

1. **Access**: Navigate to `/new-customer` after logging in
2. **Fill Form**: Complete personal and address information
3. **Check Availability**: System automatically checks infrastructure
4. **Choose Services**: Select available services or request unavailable ones
5. **Submit**: Complete registration and service requests

### For Administrators

1. **Monitor Requests**: Check Qualification Records for new service requests
2. **Review Customers**: Access new customer data through user management
3. **Update Infrastructure**: Modify area management data as infrastructure improves
4. **Process Requests**: Handle service requests and update customer status

## Configuration

### Districts & Provinces
The system includes all official Sri Lanka districts and provinces:

**Provinces**: Western, Central, Southern, North Western, North Central, Eastern, Northern, Uva, Sabaragamuwa

**Districts**: Colombo, Gampaha, Kalutara, Kandy, Matale, Nuwara Eliya, Galle, Matara, Hambantota, Jaffna, Kilinochchi, Mullaitivu, Vavuniya, Mannar, Puttalam, Kurunegala, Anuradhapura, Polonnaruwa, Badulla, Monaragala, Ratnapura, Kegalle, Trincomalee, Batticaloa, Ampara

### Infrastructure Types
- **Fiber**: GPON technology, up to 1000 Mbps
- **ADSL**: ADSL2+ technology, up to 24 Mbps  
- **Mobile**: 4G LTE, 3G technologies

## API Endpoints

### Frontend Routes
- `/new-customer` - New customer onboarding form
- `/dashboard` - Return to main dashboard

### Backend APIs
- `/api/users` - User management
- `/api/areaManagement/v5/area` - Area and infrastructure data
- `/api/productOfferingQualification/v5/checkProductOfferingQualification` - Service qualification

## Error Handling

### Validation Errors
- Required field validation for personal and address information
- Email format validation
- Phone number validation

### Infrastructure Errors
- Graceful fallback when area data not found
- Default infrastructure availability calculation
- User-friendly error messages

### Network Errors
- Retry mechanisms for API calls
- Fallback to Firebase storage if MongoDB unavailable
- Comprehensive error logging

## Security Considerations

### Data Protection
- User data encrypted in transit and at rest
- Access control through authentication system
- GDPR compliance for personal data handling

### API Security
- Rate limiting on user creation endpoints
- Input validation and sanitization
- CORS configuration for cross-origin requests

## Future Enhancements

### Planned Features
1. **Geolocation**: GPS coordinates for precise location mapping
2. **Service Packages**: Pre-configured service bundles
3. **Payment Integration**: Online payment for service activation
4. **Mobile App**: Native mobile application for onboarding
5. **Multi-language**: Sinhala and Tamil language support

### Technical Improvements
1. **Real-time Updates**: WebSocket integration for live infrastructure updates
2. **Advanced Analytics**: Customer behavior and service preference analytics
3. **AI Integration**: Machine learning for infrastructure availability prediction
4. **Performance**: Caching and optimization for faster response times

## Troubleshooting

### Common Issues

1. **Infrastructure Check Fails**
   - Verify Area Management API is running
   - Check district/province data exists
   - Review API endpoint configuration

2. **User Creation Fails**
   - Validate MongoDB connection
   - Check user model schema
   - Verify required fields are provided

3. **Service Request Not Appearing**
   - Check qualification API integration
   - Verify request data format
   - Review admin dashboard configuration

### Debug Information
- Enable console logging for detailed error information
- Check browser network tab for API call details
- Review MongoDB logs for database errors
- Monitor API endpoint health status

## Support

For technical support or questions about the New Customer Onboarding System:

1. **Documentation**: Review this README and related API documentation
2. **Logs**: Check application and database logs for error details
3. **API Testing**: Use Postman or similar tools to test API endpoints
4. **Development Team**: Contact the development team for complex issues

## Version History

- **v1.0.0** - Initial implementation with basic onboarding flow
- **v1.1.0** - Added infrastructure availability checking
- **v1.2.0** - Integrated with existing SLT systems
- **v1.3.0** - Enhanced error handling and validation
