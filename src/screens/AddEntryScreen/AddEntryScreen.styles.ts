import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    width: 80,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  cameraPlaceholder: {
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  cameraPlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 10,
  },
  secondaryBtn: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  locationLoadingText: {
    fontSize: 14,
  },
  addressBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  addressPlaceholder: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  coordText: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: -4,
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});