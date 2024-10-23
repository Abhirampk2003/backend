// const SerialPort = require('serialport');
// const Readline = require('@serialport/parser-readline');
// const express = require('express'); // Backend logic (even without web)

// // Create an Express application (not used for web, only for logical flow)
// const app = express();

// // Replace 'COM3' with the correct port for your STM32
// const port = new SerialPort('COM3', { baudRate: 9600 });
// const parser = port.pipe(new Readline({ delimiter: '\n' }));

// // Listen for data from STM32 (this could be temperature updates or process statuses)
// parser.on('data', (data) => {
//     console.log('Received from STM32:', data);
    
//     // Simulate process stages based on the response
//     if (data.includes('HEATED_45')) {
//         console.log('Temperature reached 45°C. Starting mixing...');
//         startMixing();
//         // Send update to LCD
//         const updateCommand = '!UPDATE_MIXING\n';
//         port.write(updateCommand);
//     } 
//     else if (data.includes('MIXING_DONE')) {
//         console.log('Mixing completed. Starting buffering process...');
//         startBuffering();
//         // Send update to LCD
//         const updateCommand = '!UPDATE_BUFFERING\n';
//         port.write(updateCommand);
//     }
//     else if (data.includes('BUFFERING_DONE')) {
//         console.log('Buffering completed. Starting separation process...');
//         startSeparation();
//         // Send update to LCD
//         const updateCommand = '!UPDATE_SEPARATION\n';
//         port.write(updateCommand);
//     }
//     else if (data.includes('SEPARATION_DONE')) {
//         console.log('Separation completed. Process finished.');
//         // Send update to LCD
//         const updateCommand = '!FINISHED\n';
//         port.write(updateCommand);
//     }
// });

// // Mixing step function
// function startMixing() {
//     const command = '!START_MIXING\n';
//     port.write(command, (err) => {
//         if (err) {
//             console.error('Error sending command:', err);
//         } else {
//             console.log('Mixing process started');
//         }
//     });
// }

// // Buffering step function to remove impurities
// function startBuffering() {
//     const command = '!START_BUFFERING\n';
//     port.write(command, (err) => {
//         if (err) {
//             console.error('Error sending command:', err);
//         } else {
//             console.log('Buffering process started');
//         }
//     });
// }

// // Separation step function (elution buffer)
// function startSeparation() {
//     const command = '!START_SEPARATION\n';
//     port.write(command, (err) => {
//         if (err) {
//             console.error('Error sending command:', err);
//         } else {
//             console.log('Separation process started');
//         }
//     });
// };

// // Start the Express server to manage backend logic (only used for logic, no web needed)
// app.listen(3000, () => {
//     console.log('Backend logic running for process control');
// });



const {SerialPort} = require('serialport');
const Readline = require('@serialport/parser-readline');
const express = require('express'); // Backend logic (even without web)

// Create an Express application (not used for web, only for logical flow)
const app = express();

// Replace 'COM3' with the correct port for your STM32
const port = new SerialPort('COM3', { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));

// Listen for data from STM32 (this could be temperature updates or process statuses)
parser.on('data', (data) => {
    console.log('Received from STM32:', data);

    // Check for the start button click event from the STM32
    if (data.includes('START_BUTTON_CLICKED')) {
        console.log('Start button clicked on LCD. Starting heating process...');
        startHeating(); // Initiate heating process
    }

    // Process real-time temperature updates from STM32
    if (data.includes('TEMP_')) {
        const tempValue = data.split('_')[1]; // Assuming temperature is sent as TEMP_45, TEMP_46, etc.
        console.log(`Current Temperature: ${tempValue}°C`);
        
        // Update LCD with real-time temperature
        updateLCD(`TEMP_${tempValue}`);
        
        if (tempValue === '45') {
            console.log('Temperature reached 45°C. Heating complete, proceeding with next stages...');
            // LCD Update
            updateLCD('HEATING_DONE');
        }
    }

    // Other process updates from STM32 (no need to send commands back, just relay to LCD)
    if (data.includes('MIXING_DONE')) {
        console.log('Mixing completed.');
        updateLCD('MIXING_DONE');
    }
    else if (data.includes('BUFFERING_DONE')) {
        console.log('Buffering completed.');
        updateLCD('BUFFERING_DONE');
    }
    else if (data.includes('SEPARATION_DONE')) {
        console.log('Separation completed. Process finished.');
        updateLCD('PROCESS_FINISHED');
    }
});

// Function to start the heating process by sending a command to the STM32
function startHeating() {
    const command = '!START_HEATING\n';
    port.write(command, (err) => {
        if (err) {
            console.error('Error sending heating command:', err);
        } else {
            console.log('Heating command sent to STM32. Waiting for temperature updates...');
        }
    });
}

// Function to send updates to the LCD display
function updateLCD(status) {
    const lcdUpdateCommand = `!${status}\n`;
    port.write(lcdUpdateCommand, (err) => {
        if (err) {
            console.error('Error sending update to LCD:', err);
        } else {
            console.log(`LCD updated with: ${status}`);
        }
    });
}

// Start the Express server to manage backend logic (only used for logic, no web needed)
app.listen(3000, () => {
    console.log('Backend logic running for process control');
});
