import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import AWS from 'aws-sdk';
import { List, ListItem, ListItemText, Button, Box } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';

const S3_BUCKET_NAME = process.env.REACT_APP_S3_BUCKET_NAME;
const S3_REGION = process.env.REACT_APP_S3_REGION;
const S3_ACCESS_KEY_ID = process.env.REACT_APP_S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.REACT_APP_S3_SECRET_ACCESS_KEY;

AWS.config.update({
  region: S3_REGION,
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

function FileDropzone() {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach(file => {
      const params = {
        Bucket: S3_BUCKET_NAME,
        Key: file.name,
        Body: file,
      };

      s3.upload(params, function (err, data) {
        if (err) {
          console.error('Error uploading file:', err);
        } else {
          console.log('Successfully uploaded file:', data);
          setFiles(prevFiles => [...prevFiles, { name: file.name, url: data.Location }]);
        }
      });
    });
  }, []);

  useEffect(() => {
    const params = {
      Bucket: S3_BUCKET_NAME,
    };

    s3.listObjectsV2(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log(data);
        const fileData = data.Contents.map(file => {
          return {
            name: file.Key,
            url: `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${file.Key}`
          };
        });
        setFiles(fileData);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Box
      sx={{
        border: '1px solid grey',
        borderRadius: '4px',
        padding: '16px',
        marginTop: '16px',
      }}
    >
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      <List>
        {files.map((file, index) => (
          <ListItem key={index}>
            <ListItemText primary={file.name} />
            <Button
              variant="contained"
              startIcon={<GetAppIcon />}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default FileDropzone;