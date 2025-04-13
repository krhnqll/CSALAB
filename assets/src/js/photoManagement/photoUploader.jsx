import React, { useState } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { documentService } from '../general/documentservice';
import ToastMessage from '../ToastManagement/toastMessage';

const FotoYukle = ({ setPhoto }) => {
    const [imageUri, setImageUri] = useState(null);
    const [toast, setToast] = useState(null);

    const pickImage = () => {
        launchCamera(
            {
                mediaType: 'photo',
                includeBase64: false,
                noData: true,
            },
            (response) => {
                if (response.didCancel) {
                    <Text>{'Fotoğraf çekimi iptal edildi'}</Text>;
                } else if (response.errorCode) {
                    <Text>{'Fotoğraf çekimi hatası:' + response.errorMessage}</Text>;
                } else {
                    const uri = response.assets[0].uri;
                    setImageUri(uri);
                    setPhoto(uri);
                    sendPhotoToAPI(uri);
                }
            }
        );
    };

    const sendPhotoToAPI = async (uri) => {
        const formData = new FormData();
        formData.append('photo', {
            uri: uri,
            type: 'image/jpeg',
            name: 'photo.jpg',
        });

        try {
            const result = await documentService.postWithFile('upload', formData);
            console.log('Başarıyla gönderildi:', result);
            setToast({ message: 'Fotoğraf Başarıyla Gönderildi!', type: 'success' });
        } catch (error) {
            console.error('API Hatası:', error);
            <Text>{'Fotoğraf gönderilemedi.'}</Text>;
        }
    };

    const handleRemovePhoto = () => {
        setImageUri(null);
        setPhoto(null);
    };


    return (
        <>
            {toast && (
                <ToastMessage
                    message={toast.message}
                    type={toast.type}
                    onHide={() => setToast(null)}
                />
            )}
            <Button title="Fotoğraf Çek" onPress={pickImage} />
            {imageUri && (
                <>
                    <Image source={{ uri: imageUri }} style={styles.image} />
                    <TouchableOpacity style={styles.removeButton} onPress={handleRemovePhoto}>
                        <Text style={styles.removeButtonText}>Kaldır</Text>
                    </TouchableOpacity>
                </>
            )}

        </>
    );
};

const styles = StyleSheet.create({
    image: {
        width: 200,
        height: 200,
        marginVertical: 20,
    },
    removeButton: {
        backgroundColor: 'red',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 10,
    },
    removeButtonText: {
        color: 'white',
        fontSize: 14,
    },

});

export default FotoYukle;
