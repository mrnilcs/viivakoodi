import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import FinnishBankUtils from 'finnish-bank-utils'; // Make sure this import is correct
import Barcode from 'react-barcode';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import './App.css';


function IbanForm() {
  // Initialize states with empty values for user input
  const [iban, setIban] = useState(localStorage.getItem('iban') || '');
  const [sum, setSum] = useState(localStorage.getItem('sum') || '');
  const [dueDate, setDueDate] = useState(
    localStorage.getItem('dueDate')
      ? new Date(localStorage.getItem('dueDate'))
      : new Date()
  );  const [validationState, setValidationState] = useState('');
  const [barcode, setBarcode] = useState('');
  const [error, setError] = useState('');
  const barcodeRef = useRef(null);
  const referenceNumber = '55958 22432 94671'; // Example of a hard-coded valid reference number

  useEffect(() => {
    // Save input field values to localStorage whenever they change
    localStorage.setItem('iban', iban);
    localStorage.setItem('sum', sum);
    localStorage.setItem('dueDate', dueDate.toISOString());
  }, [iban, sum, dueDate]);


  const handleDateChange = (date) => {
    setDueDate(date);
  };


  const copyToClipboard = (e) => {
    barcodeRef.current.select();
    document.execCommand('copy');
    e.target.focus();
    // Optionally, you can show a tooltip/popover to indicate the text was copied.
  };

  const handleIbanChange = (e) => {
    const input = e.target.value;
    // Only keep alphanumeric characters and spaces (for better user experience)
    let value = input.replace(/[^A-Za-z0-9 ]/g, '');
  
    // Split the value into groups of 4 characters separated by spaces
    const match = value.split(' ').join('').match(/.{1,4}/g);
    
    let formattedValue = match ? match.join(' ') : '';
  
    // Check if we should trigger validation. We do this by counting the actual characters entered,
    // ignoring spaces, to know when the user has entered a complete IBAN.
    const actualLength = formattedValue.replace(/ /g, '').length;
  
    setIban(formattedValue);
    setError(''); // Clear any previous errors
  
    if (actualLength === 18) { // Checking the length of the IBAN without spaces
      validateIban(formattedValue); // You could validate the IBAN here
    } else {
      setValidationState(''); // Reset validation state if the length requirement is not met
    }
  };
  
  
  
  const validateIban = (iban) => {
    // Implement your validation logic here
    const isValidIban = FinnishBankUtils.isValidFinnishIBAN(iban.replace(/\s/g, '')); // validation without spaces
    setValidationState(isValidIban ? 'is-valid' : 'is-invalid');
  
   
  };
  

  const validateAndGenerateBarcode = () => {
  
    const parsedSum = parseFloat(sum);
    if (isNaN(parsedSum)) {
      setError('Invalid sum. Please provide a numeric value.');
      return;
    }
  
    // Format the date in the format "dd.MM.yyyy"
    const formattedDate = format(dueDate, 'dd.MM.yyyy');
  
    // Generate barcode
    try {
      const generatedBarcode = FinnishBankUtils.formatFinnishVirtualBarCode({
        iban: iban,
        sum: parsedSum,
        reference: referenceNumber,
        date: formattedDate, // pass the formatted date string here instead of the Date object
      });
      setBarcode(generatedBarcode);
    } catch (error) {
      console.error("Error generating barcode:", error);
      setError('There was an error generating the barcode. Please check your inputs and try again.');
    }
  };


  return (
    
    <div className="container mt-5">
      
<div className="mb-3">
  <label htmlFor="ibanField" className="form-label">Tilinumero</label>
  <input 
    type="text"
    className={`form-control ${validationState}`}
    id="ibanField"
    value={iban}
    onChange={handleIbanChange}
    placeholder="FI29 1220 3500 6578 75"
    maxLength="22" 
  />
</div>
      <div className="mb-3">
  <label htmlFor="sumField" className="form-label">Summa</label>
  <input 
    type="number" 
    className="form-control"
    id="sumField"
    value={sum}
    onChange={(e) => setSum(e.target.valueAsNumber || '')} // Ensuring we're working with a number, and prevent null on deletion
    placeholder="12.50"
    min="0" // Prevents negative amounts
    step="0.01" // Allows cents to be entered
    pattern="\d+(\.\d{2})?" // This pattern demands at least the cents part to be entered, you can remove it if you want more flexibility
    inputMode="decimal" // Brings up the numeric keypad on supported devices, useful for monetary values
    maxLength="6" 

  />
</div>
<div className="mb-3">
  <label htmlFor="dueDateField" className="form-label">Eräpäivä</label>
  <br />
  <DatePicker
    selected={dueDate}
    onChange={handleDateChange}
    dateFormat="dd.MM.yyyy"
    className="form-control"
    id="dueDateField"
  />
</div>
      <div className="mb-3">
        <button 
          className="btn btn-primary" 
          onClick={validateAndGenerateBarcode}
        >
          Luo Viivakoodi
        </button>
      </div>
  
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
  
  {barcode && (
    
        <div className="input-group mb-3">
          <input 
            type="text"
            ref={barcodeRef}
            value={barcode}
            className="form-control"
            readOnly
          />
  <div className="input-group-append">
  <button
  className="btn btn-outline-secondary"
  type="button"
  onClick={copyToClipboard}
  data-toggle="tooltip"
  data-placement="top"
  title="Copy to Clipboard"
>
  Copy
</button>
  </div>
          <div className="mb-3">
          <div className="barcode-container">
          <Barcode value={barcode} format="CODE128" />
          </div>

        </div>
        </div>
        
      )}
    </div>
  );
  
}

export default IbanForm;
