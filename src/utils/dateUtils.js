// src/utils/dateUtils.js

/**
 * Formats a database date string into a Bangladesh-friendly format.
 * Example Input: "2026-01-04T16:30:00.000Z"
 * Example Output: "04/01/2026, 10:30 PM"
 */
export const formatBDSDate = (dateInput) => {
  if (!dateInput) return "N/A";

  const date = new Date(dateInput);

  // Check if the date is valid to prevent app crashes
  if (isNaN(date.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Dhaka", // Forces Bangladesh time regardless of computer settings
  }).format(date);
};

// Use it like .....

// import React from 'react';
// import { formatBDSDate } from '../utils/dateUtils'; // Adjust path based on your folder

// const ProductList = ({ products }) => {
//   return (
//     <table>
//       <thead>
//         <tr>
//           <th>Product Name</th>
//           <th>Last Updated</th>
//         </tr>
//       </thead>
//       <tbody>
//         {products.map(product => (
//           <tr key={product.id}>
//             <td>{product.name}</td>
//             {/* Usage of your "middleware" helper here */}
//             <td>{formatBDSDate(product.updatedAt)}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// };
