import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    overflow: 'hidden',
    borderWidth: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 220,
  },
  trashIconBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  pinIcon: {
    marginRight: 4,
    marginTop: 2,
  },
  address: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  date: {
    fontSize: 13,
    marginTop: 2,
    marginLeft: 22,
    fontWeight: '500',
  },
});