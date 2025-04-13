import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, Modal, View, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import FotoYukle from '../photoManagement/photoUploader';
import { documentService } from '../general/documentservice';

const Takvim = ({ selectedDate, setSelectedDate }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentDate, setCurrentDate] = useState('');
    const [photo, setPhoto] = useState(null);
    const [aciklama, setAciklama] = useState('');
    const [not, setNot] = useState('');
    const [veriler, setVeriler] = useState({}); // Tüm kayıtlar
    const [editingIndex, setEditingIndex] = useState(null);

    useEffect(() => { //veri çekme gönderme işlemleri burada gerçekleşecek.

        const fetchLabData = async () => { //DocumentService kullanılacak. Fotoğraf + data gönderme işlemi yapılacağı için farklı service.

            try {
                const data = await documentService.get('');
                const parsedData = {};

                data.array.forEach(item => {
                    const date = item.date; // Gelen verilere göre parametre adını düzenle. !!!!!!!!!!!
                    const rec = {
                        description: item.description, //Gelen verilere göre parametre adını düzenle. !!!!!!!!
                        note: item.note, //Gelen verilere göre parametre adını düzenle. !!!!!!!!
                        photo: item.photoUrl, //Gelen verilere göre parametre adını düzenle. !!!!!!!!
                    };

                    if (!parsedData[date]) {
                        parsedData[date] = [rec];
                    }
                    else {
                        parsedData[date].push[rec];
                    }
                });

            }
            catch (error) {
                console.error('Veri Getirme Esnasında Hata!', error);
            }
        };
        fetchLabData();
    }, []);

    const postLabData = async (rec, date) => { //Seçilen tarihe göre fotoğrafların + data'ların gönderildiği func.
        try {
            if (rec.photo && typeof rec.photo !== 'string') {
                const formData = new FormData();
                formData.append('aciklama', rec.aciklama);
                formData.append('not', rec.not);
                formData.append('date', date);
                formData.append('photo', {
                    uri: rec.photo.uri,
                    type: rec.photo.type || 'image/jpeg',
                    name: rec.photo.fileName || 'photo.jpg',
                });

                await documentService.postWithFile('LabData/Upload', formData);
            } else {
                // Fotoğrafsız veri gönderimi
                await documentService.post('LabData', {
                    aciklama: rec.aciklama,
                    not: rec.not,
                    date: date,
                    photoUrl: rec.photo || null,
                });
            }
        } catch (error) {
            console.error('Kayıt gönderilirken hata:', error);
        }
    };


    const onDateChange = (date) => {
        const selected = new Date(date.dateString);
        const today = new Date();
        selected.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (selected <= today) {
            setSelectedDate(date.dateString);
            setCurrentDate(date.dateString);
            setModalVisible(true);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setPhoto(null);
        setAciklama('');
        setNot('');
        setEditingIndex(null);
    };

    const handleSave = () => {
        if (!aciklama && !not && !photo) {
            Alert.alert('Uyarı', 'Boş kayıt eklenemez.');
            return;
        }

        const yeniKayit = { aciklama, not, photo };

        setVeriler((prev) => {
            const eskiKayitlar = prev[currentDate] || [];
            let guncellenmisKayitlar = [...eskiKayitlar];

            if (editingIndex !== null) {
                guncellenmisKayitlar[editingIndex] = yeniKayit;
            } else {
                guncellenmisKayitlar.push(yeniKayit);
            }

            return {
                ...prev,
                [currentDate]: guncellenmisKayitlar,
            };
        });
        postLabData(yeniKayit, currentDate);
        closeModal();
    };

    const handleEdit = (index) => {
        const kayit = veriler[currentDate][index];
        setAciklama(kayit.aciklama);
        setNot(kayit.not);
        setPhoto(kayit.photo);
        setEditingIndex(index);
    };

    const handleDelete = (index) => {
        Alert.alert('Sil', 'Bu kaydı silmek istediğinize emin misiniz?', [
            { text: 'İptal', style: 'cancel' },
            {
                text: 'Sil',
                onPress: () => {
                    setVeriler((prev) => {
                        const guncel = [...(prev[currentDate] || [])];
                        guncel.splice(index, 1);
                        return {
                            ...prev,
                            [currentDate]: guncel,
                        };
                    });
                },
                style: 'destructive',
            },
        ]);
    };

    const isDateMarked = Object.keys(veriler).reduce((acc, tarih) => {
        acc[tarih] = {
            marked: true,
            dotColor: 'red',
            selected: tarih === selectedDate,
            selectedColor: 'blue',
            selectedTextColor: 'white',
        };
        return acc;
    }, {});

    const renderItem = ({ item, index }) => (
        <View style={styles.kayitItem}>
            <Text style={styles.kayitText}>📌 Açıklama: {item.aciklama}</Text>
            <Text style={styles.kayitText}>📝 Not: {item.not}</Text>
            <View style={styles.kayitButtons}>
                <TouchableOpacity style={styles.duzenleButton} onPress={() => handleEdit(index)}>
                    <Text style={styles.buttonText}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.silButton} onPress={() => handleDelete(index)}>
                    <Text style={styles.buttonText}>Sil</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.wrapper}>
            <Calendar
                onDayPress={onDateChange}
                markedDates={isDateMarked}
            />

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Seçilen Tarih: {currentDate}</Text>

                        <View style={styles.modalBody}>
                            <View style={styles.leftColumn}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Açıklama"
                                    value={aciklama}
                                    onChangeText={setAciklama}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Not"
                                    value={not}
                                    onChangeText={setNot}
                                />
                            </View>

                            <View style={styles.rightColumn}>
                                <FotoYukle setPhoto={setPhoto} />
                            </View>
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.buttonText}>{editingIndex !== null ? 'Güncelle' : 'Kaydet'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                                <Text style={styles.buttonText}>Kapat</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={veriler[currentDate] || []}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={renderItem}
                            style={{ marginTop: 20, width: '100%' }}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#f5a63f',
        padding: 20,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    modalBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    leftColumn: {
        flex: 1,
        paddingRight: 10,
    },
    rightColumn: {
        flex: 1,
        alignItems: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: 'green',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    closeButton: {
        backgroundColor: 'gray',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    kayitItem: {
        backgroundColor: '#eee',
        padding: 10,
        marginVertical: 5,
        borderRadius: 8,
    },
    kayitText: {
        fontSize: 14,
        marginBottom: 5,
    },
    kayitButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    duzenleButton: {
        backgroundColor: 'blue',
        padding: 5,
        borderRadius: 5,
    },
    silButton: {
        backgroundColor: 'red',
        padding: 5,
        borderRadius: 5,
    },
});

export default Takvim;
