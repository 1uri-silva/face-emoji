import { useCallback, useEffect, useState } from 'react';
import { ImageSourcePropType, Text } from 'react-native';
import { Camera, CameraType, FaceDetectionResult } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
} from 'react-native-reanimated';

import neutralFace from '../assets/neutral-face.png';
import faceSmilingEyes from '../assets/face-smiling-eyes.png';

export function Home() {
	const [permission, requestPermission] = Camera.useCameraPermissions();
	const [faceDetected, setFaceDetected] = useState(false);
	const [emoji, setEmoji] = useState<ImageSourcePropType>(neutralFace);

	const valueShared = useSharedValue({
		width: 0,
		height: 0,
		x: 0,
		y: 0,
	});

	const styleFace = useAnimatedStyle(() => ({
		position: 'absolute',
		zIndex: 1,
		width: valueShared.value.width,
		height: valueShared.value.height,
		transform: [
			{ translateX: valueShared.value.x },
			{ translateY: valueShared.value.y },
		],
	}));

	useEffect(() => {
		requestPermission().then((res) => {
			if (!res.granted) {
				return null;
			}
		});
	}, [requestPermission]);

	const faceDetector = useCallback(
		({ faces }: FaceDetectionResult) => {
			const face = faces[0] as any;
			if (face) {
				const { size, origin } = face.bounds;

				valueShared.value = {
					height: size.height,
					width: size.width,
					x: origin.x,
					y: origin.y,
				};

				setFaceDetected(true);
				// console.log(face);
				if (face.smilingProbability > 0.5) {
					setEmoji(faceSmilingEyes);
				} else {
					setEmoji(neutralFace);
				}
			} else {
				setFaceDetected(false);
			}
		},
		[valueShared]
	);

	return (
		<>
			{!permission ? (
				<Text style={{ fontSize: 17, textAlign: 'center' }}>
					Você não concedeu acesso a câmera
				</Text>
			) : (
				<>
					{faceDetected && <Animated.Image source={emoji} style={styleFace} />}
					<Camera
						style={{ flex: 1 }}
						type={CameraType.front}
						onFacesDetected={faceDetector}
						faceDetectorSettings={{
							mode: FaceDetector.FaceDetectorMode.fast,
							detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
							runClassifications: FaceDetector.FaceDetectorClassifications.all,
							minDetectionInterval: 100,
							tracking: true,
						}}
					/>
				</>
			)}
		</>
	);
}
