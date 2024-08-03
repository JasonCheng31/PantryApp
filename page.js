'use client'
import Image from "next/image";
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Box, Modal, Typography, Stack, TextField, Button } from "@mui/material";
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc,writeBatch } from "firebase/firestore";

export default function Home() {
  const [inventory, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); 

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setPantry(pantryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };
  const removeAllItems = async () => {
    const batch = writeBatch(firestore);
    const snapshot = await getDocs(query(collection(firestore, 'inventory')));
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    await updateInventory();
  };
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const searchInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          sx={{ transform: "translate(-50%, -50%)" }}
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant='outlined'
              fullWidth
              
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
            <Button variant="outlined" onClick={() => {
              addItem(itemName);
              setItemName('');
              handleClose();
            }}>
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Button
        
        variant="contained"
        onClick={() => {
          handleOpen();
        }}
      >
        Add Pantry
      </Button>
      <Button
  variant="contained"
  color="error"
  onClick={removeAllItems}
  style={{ marginBottom: '20px' }}
>
  Remove All
</Button>
      <TextField
        variant='outlined'
        placeholder='Search for pantry...'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ 
          marginBottom: '20px', 
          width:'700px',
        }}
      />

      <Box border='1px solid #333'>
        <Box
          width="1500px"
          height="100px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="#ADD8E6"
        >
          <Typography variant='h2' color="#333">
            Pantry Items
          </Typography>
        </Box>

        <Stack width="1500px" height="800px" spacing={2} overflow="auto">
          {searchInventory.map(({ name, quantity }) => (
            <Box key={name}
              width="100%"
              minHeight="150px"
              display='flex'
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              padding={5}
            >
              <Typography
                variant='h3'
                color='#333'
                width="50%"
                textAlign="left"
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>

              <Typography
                variant='h3'
                color='#333'
                width="20%"
                textAlign="center"
              >
                Quantity: {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => {
                    addItem(name);
                  }}
                >
                  Add
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    removeItem(name);
                  }}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
