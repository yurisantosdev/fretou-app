import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,

} from 'react-native';
import { type Notice } from '@/components/Toast';
import { VehicleFormFields } from './_components/VehicleFormFields';
import { Vehicle, VehicleFormData } from './types';

export function VehicleForm({
  visible,
  vehicle,
  creating,
  notice,
  onDismissNotice,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  vehicle: Vehicle | null;
  creating: boolean;
  notice: Notice | null;
  onDismissNotice: () => void;
  onCancel: () => void;
  onSubmit: (data: VehicleFormData) => void | Promise<void>;
}) {

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        className="flex-1 justify-end"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable className="flex-1 bg-navy/50" onPress={onCancel} />
        {visible ? (
          <VehicleFormFields
            key={vehicle?._id ?? 'novo'}
            vehicle={vehicle}
            creating={creating}
            notice={notice}
            onDismissNotice={onDismissNotice}
            onCancel={onCancel}
            onSubmit={onSubmit}
          />
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}


