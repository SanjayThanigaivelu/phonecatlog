import React,{useState,useEffect} from 'react'
import './Fit.css';
//import axios from 'axios'
import {MenuItem,FormControl, InputLabel,Select,Typography,Modal,Box,Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,Button, TextField } from '@mui/material';
import ProgressDial from './ProgressDial/ProgressDial';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm,Controller } from 'react-hook-form';
import workoutData from './workout.json';
import ClockImage from './Clock.jpg'


function Fitness() {
  const[forgetBoxOpen,setForgetBox]=useState(false);
  const[forgetBoxOpen1,setForgetBox1]=useState(false);
  const[forgetBoxOpen2,setForgetBox2]=useState(false);
const[forgetBoxOpen3,setForgetBox3]=useState(false);

  const [selectedWorkout, setSelectedWorkout] = useState(""); // Stores selected workout
  const [selectedMotion, setSelectedMotion] = useState(""); // Stores selected motion
  const [selectedMET, setSelectedMET] = useState(null); // Stores MET value of selected motion
  const [motionOptions, setMotionOptions] = useState([]); 
  const [time, setTime] = useState(0); 
  const [isRunning, setIsRunning] = useState(false);


  const [logActivity, setLogActivity] = useState([]);
  const [userData1, setUserData1] = useState({ Height: '', Weight: '', GoalWeight: '' });
  const [timeStorage, setTimeStorage] = useState([]);
//-----------------------------------------------------------------------------------------------------------------------------------


  const currentDate = new Date().toLocaleDateString('en-GB'); //Current Date Function to display the date

  //------------------------------------------------------Calories Burned Using MET Formula------------------------------------------------------------------------

  const calculateCaloriesBurned = (MET, weight, time) => {
    if (isNaN(MET) || isNaN(weight) || isNaN(time)) {
      return 0; // Return 0 if any of the inputs are invalid
    }
  
    // Convert time from "00m:14s" to hours
    const [minutes, seconds] = time.split(":").map(num => parseInt(num, 10));
    const timeInHours = (minutes + (seconds / 60)) / 60; // Convert total time in minutes to hours
    return MET * weight * timeInHours;
  };


//-------------------------------------------------------------Table------------------------------------------------------------------------------
useEffect(() => {
  // Fetching userData from localStorage
  const storedUserData = JSON.parse(localStorage.getItem('UserData')) || {};
  setUserData1(storedUserData);

  // Fetching TimeStorage from localStorage
  const storedTimeStorage = JSON.parse(localStorage.getItem('TimeStorage')) || [];
  setTimeStorage(storedTimeStorage);

  // Fetching workoutData from localStorage (array of workouts)
  const storedWorkoutData = JSON.parse(localStorage.getItem('workoutData')) || [];
  setLogActivity(storedWorkoutData);
}, []);
//--------------------------------------------------Dial Progress----------------------------------------------------------------------------------------
const calculateValuesForDials = (logActivity, userData1, timeStorage) => {
  let totalCaloriesBurned = 0;

  logActivity.forEach((activity, index) => {
    const time = timeStorage[index] || "00:00"; // Get corresponding time
    const calories = calculateCaloriesBurned(
      activity.selectedMET, // MET value
      parseFloat(userData1.Weight), // Current weight from state
      time
    );
  

    if (!isNaN(calories)) {
      totalCaloriesBurned += calories; // Add valid calories
    }
  });

  // Calculate weight loss
  const weightLossInKg = totalCaloriesBurned / 7700; // 7700 kcal = 1 kg weight loss
  const currentWeight = parseFloat(userData1.Weight) - weightLossInKg;

  return {
    totalCaloriesBurned: totalCaloriesBurned.toFixed(2), // Total calories burned
    currentWeight: currentWeight.toFixed(2), // Current weight
    totalWeightLost: weightLossInKg.toFixed(2), // Total weight lost
  };
};

// Max Calories and Weight Loss Target
const maxCalories = () => {
  const weight = parseFloat(userData1.Weight);
  const goalWeight = parseFloat(userData1.GoalWeight);

  if (isNaN(weight) || isNaN(goalWeight)) {
    return 0; // Handle invalid data
  }

  const weightLossRequired = weight - goalWeight;
  return weightLossRequired * 7700; // Total calories needed to burn
};

// Max Weight Loss Target
const maxWeightLoss = () => {
  const weight = parseFloat(userData1.Weight);
  const goalWeight = parseFloat(userData1.GoalWeight);

  if (isNaN(weight) || isNaN(goalWeight)) {
    return 0; // Handle invalid data
  }

  return weight - goalWeight; // Total weight loss required
};

// Derived values for Progress Dials
const { totalCaloriesBurned, totalWeightLost } = calculateValuesForDials(
  logActivity,
  userData1,
  timeStorage
);



//--------------------------------------------------------------Schema 's-----------------------------------------------------------------------
  const schema=yup.object().shape({
    Height:yup
    .string()
    .matches(/^\d+$/, "Height needs to be in number and in cm")  // Ensures that only digits are allowed
    .test('is-cm', 'Height must be a positive value and in cm', (value) => {
      return value && Number(value) > 0;  // Ensure the value is positive
    })
    .required("Height is required"),
    Weight:yup
    .string()
    .matches(/^\d+$/, "Weight  needs to be a number and in Kg")
    .test('is-kg', 'Weight must be a positive value and in Kg', (value) => {
      return value && Number(value) > 0;  // Ensure the value is positive
    })
     .required("Weight is required"),
     GoalWeight:yup
     .string()
    .matches(/^\d+$/, "GoalWeight needs to be a number and in Kg")
    .test('is-kg', 'GoalWeight must be a positive value and in Kg', (value) => {
      return value && Number(value) > 0;  // Ensure the value is positive
    })
     .required("Weight is required")
  })

  const{handleSubmit,control,formState: {errors},reset}=useForm({
    resolver:yupResolver(schema),
    defaultValues:{
      Height:'',
      Weight:'',
      GoalWeight:''
    },
    mode:'onChange'
  });

  //---------------------------------------------------------------------------------------------------------------------------------
const schema1=yup.object().shape({
  steps:yup
  .number() // Validates that the input is numeric
    .typeError("Steps need to be a valid number") // If the input isn't a number
    .positive("Steps must be a positive number") // Ensures the number is positive
    .integer("Steps must be a whole number") // Ensures no decimal values
    .required("Steps count is required"),
})

const {handleSubmit:handle1,control:control1,formState:{errors:errors1},reset:reset1}=useForm({
  resolver:yupResolver(schema1),
  defaultValues:{
    steps:''
  },
  mode:'onChange'
})

  //-------------------------------------------------------------------------------------------------------------------------------
  useEffect(() => {
    const savedData = localStorage.getItem("UserData");
    if (savedData) {
      reset(JSON.parse(savedData)); // Populate form with saved data
    }
  }, [reset]);

//--------------------------------------------------------------------
  useEffect(() => {
    let timerInterval = null;

    if (isRunning) {
      timerInterval = setInterval(() => {
        setTime((prevTime) => prevTime + 1); // Increment time by 1 second
      }, 1000);
    } else {
      clearInterval(timerInterval);
    }

    return () => clearInterval(timerInterval); // Cleanup interval on unmount
  }, [isRunning]);
 
//-------------------------------------------------------------Box Model Open-----------------------------------------------------------------
  const boxModel=()=>setForgetBox(true);
  const boxModelClose=()=>setForgetBox(false);

  const boxModel1=()=>setForgetBox1(true);
  const boxModelClose1=()=>setForgetBox1(false);

const boxModel2=()=>setForgetBox2(true);
const boxModelClose2=()=>setForgetBox2(false);


const boxModel3=()=>setForgetBox3(true);
const boxModelClose3=()=>setForgetBox3(false);
  //---------------------------------------------------Function 's Start-----------------------------------------------------------------------------------------

  function userData(formData){

const jsonData=JSON.stringify(formData);
localStorage.setItem("UserData",jsonData);
console.log("Data 's are stored in database",jsonData);
boxModelClose();
  }



//-----------------------------------------------------------SECOND BUTTON----------------------------------------------------------------------------------
const handleWorkoutSelect = (activity) => {
  setSelectedWorkout(activity);
  setMotionOptions(
    workoutData
      .filter(item => item.activity.toLowerCase() === activity.toLowerCase())
      .map(item => ({
        name: item.motion.trim(),
        met: item.met,
      }))
  );
  setSelectedMotion("");
  setSelectedMET(null);
};


const handleMotionSelect = (motion) => {
  const selected = motionOptions.find(option => option.name === motion);
  setSelectedMotion(motion);
  setSelectedMET(selected.met);
};
//-----------------------------------------------------Timer----------------------------------------------------------------------------------------
function startTimer(){
  boxModel2();
  setIsRunning(true);

  const now = new Date();

  // Get hours and determine AM/PM
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const amOrPm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  // Convert to 12-hour format
 
  const newTime = `${hours}:${formattedMinutes} ${amOrPm}`;

  const newworkoutData = {
    selectedWorkout: selectedWorkout,
    selectedMotion: selectedMotion,
    selectedMET:selectedMET,
    timeZone:newTime
  };
 const oldData=JSON.parse(localStorage.getItem("workoutData"))||[];
 const updatedData=[...oldData,newworkoutData];
 localStorage.setItem("workoutData",JSON.stringify(updatedData));
  setSelectedWorkout('');
setSelectedMotion('');
setSelectedMET('');
  boxModelClose1();
    } 
//-----------------------------------------------------------Formating the Time----------------------------

    const formatTime = (timeInSeconds) => {
      if (timeInSeconds >= 3600) {
        // Convert to hours and minutes if more than 60 minutes
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        return `${hours}h:${String(minutes).padStart(2, "0")}m`; // Format like 1h:25m
      } else if (timeInSeconds >= 60) {
        // Convert to minutes and seconds if more than 1 minute
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${String(minutes).padStart(2, "0")}m:${String(seconds).padStart(2, "0")}s`; // Format like 25m:45s
      } else {
        // For seconds, just show seconds
        return `00m:${String(timeInSeconds).padStart(2, "0")}s`; // Format like 00m:45s
      }
    };

function stopTimer(){
  const formattedTime = formatTime(time); // Convert the current time to string
  console.log(formattedTime);
setTime(formattedTime);
const newtime=formattedTime;
const oldvalue=JSON.parse(localStorage.getItem("TimeStorage"))||[];
const updatetime=[...oldvalue,newtime];
localStorage.setItem("TimeStorage",JSON.stringify(updatetime));
setIsRunning(false);
setTime(0);
boxModelClose2();
}
//-----------------------------------------------------------Steps Button 3-----------------------------------------------------------------------------------------------------

function StepTaken(stepData){
 const current=stepData.steps
const oldSteps=JSON.parse(localStorage.getItem("TotalSteps"))||0;
const newSteps = oldSteps + (parseFloat(current) || 0);
localStorage.setItem("TotalSteps",JSON.stringify(newSteps));
  boxModelClose3();
  reset1({
    steps:''
  })
}
  
const initialValue=JSON.parse(localStorage.getItem("TotalSteps"));

//---------------------------------------------------------------------------------------------------------------------------------------------------------
    return (
    <div className='FullContainer'>
     
     <div className='header'>
      <h2>ACT4FITNESS</h2>
  
     <Button variant="contained" color="primary" onClick={boxModel}>
        MyState
      </Button>
  
   
     </div>

     <div className='Date'>
     <h3>{currentDate}</h3>
     
 
     <Button variant="contained" color="primary"  onClick={boxModel3} sx={{ marginLeft: '550px' }}>
        Log Steps
      </Button>
     
      <Button variant="contained" color="primary" onClick={boxModel1} >
        Log Activity
      </Button>
      </div>
    
       <div className='Table1'>
       
       <TableContainer component={Paper} sx={{ width: '70%' }}>
      <Table sx={{ width: '100%' }}>
        <TableHead>
          <TableRow>
            <TableCell>Activity</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Calories Burnt</TableCell>
            <TableCell>Time Duration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {logActivity.map((activity, index) => {
              // Make sure `selectedMET` is a valid number, `Weight` is valid, and `timeStorage[index]` is valid
              const calories = calculateCaloriesBurned(
                activity.selectedMET, // MET value from workout data
                parseFloat(userData1.Weight), // Weight from userData1
                timeStorage[index] || "00:00" // Default to "00:00" if no corresponding time is found
              );

              return (
                <TableRow key={index}>
                  {/* Display the selectedMotion */}
                  <TableCell>{activity.selectedMotion}</TableCell>
                  <TableCell>{timeStorage[index] ? timeStorage[index].replace("m", "m:").replace("s", "s") : "00:00"}</TableCell>
                  {/* Display Calories Burned, ensure it's a valid number */}
                  <TableCell>{isNaN(calories) ? "N/A" : calories.toFixed(2)}</TableCell>
                  {/* Display TimeZone */}
                  <TableCell>{activity.timeZone}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
       </div>
       
       <div className='ProgressDials'>
       <ProgressDial label="10K Steps" unit="steps" value={initialValue} maxValue={10000} />
        <ProgressDial label="Cals Burnt" unit="kcal" value={parseFloat(totalCaloriesBurned)} maxValue={maxCalories()} />
        
        <ProgressDial label="Goal Weight" unit="Kg" value={parseFloat(totalWeightLost)} maxValue={maxWeightLoss()} />
      </div>
      
      <div className={`userInfo ${forgetBoxOpen ? 'blur-background' : ''}`} >

     

     
      <Modal open={forgetBoxOpen} onClose={boxModelClose} BackdropProps={{
  onClick:(e)=> e.stopPropagation()
 }}>
<Box
 sx={{
    width: 400,
    height: "auto",
    margin: "auto",  
    backgroundColor: "white",
    padding: 3,
    borderRadius: 2,
    boxShadow: 24,
    textAlign: "center",
    position: "absolute", // Ensure it uses `absolute` for the modal positioning
    top: "50%", // Center vertically
    left: "50%", // Center horizontally
    transform: "translate(-50%, -50%)",
  }}
  onClick={(e)=>e.stopPropagation()}
  >
  <Typography variant='h6' sx={{mb:2}}>
    User Information
  </Typography>
 <Box component="form" onSubmit={handleSubmit(userData)}
id='Height'
sx={{
    display:'flex',
    flexDirection:'column',
    gap:1,
    alignItems:'stretch', 
    minHeight:100,
  }}
 >
 <Controller
name="Height"
control={control}
render={({field})=>(
  <TextField
  {...field}
  error={!!errors.Height}
  helperText={errors.Height?.message}
  label="Height"
  id="Height-id"
/>
)}
/>
<br/><br/>

<Controller
name="Weight"
control={control}
render={({field})=>(
<TextField
{...field}
error={!!errors.Weight}
helperText={errors.Weight?.message}
label="Weight"
id="Weight-id"
/>
)}
/>
<br/><br/>
<Controller
name="GoalWeight"
control={control}
render={({field})=>(
  <TextField
  {...field}
  error={!!errors.GoalWeight}
  helperText={errors.GoalWeight?.message}
  label='Goal Weight'
  id='Goal Weight'
  />
)}
/>
<Button variant="contained" color="primary" type='submit' sx={{mt:5}} >Submit</Button>
 </Box>
  </Box>
 </Modal>
</div>


 <div className={`userInfo1 ${forgetBoxOpen1 ? 'blur-background1' : ''}`} >
 <Modal open={forgetBoxOpen1} onClose={boxModelClose1} BackdropProps={{
  onClick:(e)=> e.stopPropagation()
 }}>
<Box
sx={{
              width: 400,
              height: "auto",
              margin: "auto",
              backgroundColor: "white",
              padding: 3,
              borderRadius: 2,
              boxShadow: 24,
              textAlign: "center",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              overflowY: "scroll", // Make the modal scrollable
              maxHeight: "80vh", // Prevent modal from becoming too tall
            }}
            onClick={(e) => e.stopPropagation()}
  >
<Typography variant='h6' sx={{mb:2}}>
    Workout Plan
  </Typography>

  {/* Dropdown for selecting a workout */}
  <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Workout</InputLabel>
        <Select
          value={selectedWorkout}
          onChange={(e) => handleWorkoutSelect(e.target.value)}
          label="Select Workout"
        >
          {workoutData
            .map(item => item.activity)
            .filter((value, index, self) => self.indexOf(value) === index) // Unique workouts
            .map((activity, idx) => (
              <MenuItem key={idx} value={activity}>
                {activity}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

{/* Motion field */}
{selectedWorkout && motionOptions.length > 0 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Motion</InputLabel>
          <Select
            value={selectedMotion}
            label="Select Motion"
            onChange={(e) => handleMotionSelect(e.target.value)}
          >
            {motionOptions.map((option, idx) => (
              <MenuItem key={idx} value={option.name}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Submit button */}
      <Button
        variant="contained"
        color="primary"
        onClick={startTimer}
        disabled={!selectedMotion || !selectedWorkout}
      >
        Start Timer
      </Button>
 </Box>
 </Modal>
 </div>
 <div className={`userInfo2 ${forgetBoxOpen2 ? 'blur-background2' : ''}`} >
 <Modal open={forgetBoxOpen2} onClose={boxModelClose2} BackdropProps={{
  onClick:(e)=> e.stopPropagation()
 }}>
<Box
 sx={{
    width: 400,
    height: "auto",
    margin: "auto",  
    backgroundColor: "white",
    padding: 3,
    borderRadius: 2,
    boxShadow: 24,
    textAlign: "center",
    position: "absolute", // Ensure it uses `absolute` for the modal positioning
    top: "50%", // Center vertically
    left: "50%", // Center horizontally
    transform: "translate(-50%, -50%)",
  }}
  onClick={(e)=>e.stopPropagation()}
  >

<img
            src={ClockImage}
            alt="Clock"
            style={{
              width: "150px",
              height: "150px",
              marginBottom: "16px",
              
            }}
          />
<Typography variant='h6' sx={{mb:2}}>
    Timer
  </Typography>
  <Typography variant="h4"  sx={{ mb: 2 }}>{formatTime(time)}</Typography>

  <Button type='submit' variant="contained" color="primary" onClick={stopTimer}>Stop Timer & Exit</Button>
  </Box>
 </Modal>
  </div>

  <div className={`userInfo3 ${forgetBoxOpen3 ? 'blur-background3' : ''}`} >
  <Modal open={forgetBoxOpen3} onClose={boxModelClose3} BackdropProps={{
  onClick:(e)=> e.stopPropagation()
 }}>

<Box
sx={{
  width: 400,
    height: "auto",
    margin: "auto",  
    backgroundColor: "white",
    padding: 3,
    borderRadius: 2,
    boxShadow: 24,
    textAlign: "center",
    position: "absolute", // Ensure it uses `absolute` for the modal positioning
    top: "50%", // Center vertically
    left: "50%", // Center horizontally
    transform: "translate(-50%, -50%)",
            }}
            onClick={(e) => e.stopPropagation()}
  >
<Typography variant='h6' sx={{mb:2}}>
    Total Steps
  </Typography>

<Box 
component="form" onSubmit={handle1(StepTaken)}
id='Steps'
sx={{
    display:'flex',
    flexDirection:'column',
    gap:1,
    alignItems:'stretch', 
    minHeight:100,
  }}
 >
 <Controller
name="steps"
control={control1}
render={({field})=>(
  <TextField
  {...field}
  error={!!errors1.steps}
  helperText={errors1.steps?.message}
  label="Total Steps"
  id="Steps-id"
/>
)}
/>
<Button variant='contained'  color='primary' type='submit' sx={{mt:"20px"}}>Save</Button>
</Box>

  </Box>


 </Modal>

  </div>
    </div>
  )
}


export default Fitness;