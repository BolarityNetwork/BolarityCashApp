// components/PerfectVaultSavingsPlatform/styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 250,
    paddingBottom: 10,
  },

  // Chart Section Styles
  chartSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
    marginTop: 16,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartHeader: {
    height: 192,
    marginBottom: 24,
    position: 'relative',
  },
  chartYAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    justifyContent: 'space-between',
  },
  yAxisLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  chartBars: {
    marginLeft: 32,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barContainer: {
    alignItems: 'center',
  },
  barWrapper: {
    position: 'relative',
  },
  bar: {
    width: 48,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  earningsTooltip: {
    position: 'absolute',
    top: -32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tooltipText: {
    backgroundColor: '#10b981',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  barLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  chartControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  activeControl: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeControlText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inactiveControl: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  inactiveControlText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },

  // Vault Section Styles
  vaultSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  sectionAction: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  vaultList: {
    gap: 16,
  },
  vaultCardBorder: {
    borderRadius: 24,
    padding: 2,
    background: 'linear-gradient(45deg, #10b981, #06b6d4, #8b5cf6)',
  },
  vaultCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
  },
  vaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vaultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vaultIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vaultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  vaultDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  vaultApy: {
    alignItems: 'flex-end',
  },
  vaultApyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  vaultApyLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  vaultFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vaultDetails: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
  },
  vaultTypeLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  vaultTypeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  vaultMinLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  vaultMinValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  depositButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  depositButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Activity Section Styles
  activitySection: {
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 32,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  activityDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },

  // Actions Menu Styles
  actionMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 30,
  },
  actionMenuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 31,
  },
  actionMenuBackground: {
    height: 380,
    backgroundColor: '#fff',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    marginLeft: -50,
    marginRight: -50,
    paddingLeft: 50,
    paddingRight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  actionMenuContent: {
    position: 'relative',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    position: 'absolute',
  },
  actionButtonContainer: {
    alignItems: 'center',
  },
  actionButtonIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#000',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  actionButtonLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  dotsIndicator: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  inactiveDot: {
    backgroundColor: '#d1d5db',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6b7280',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  modalVaultList: {
    gap: 12,
  },
  modalVaultItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalVaultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalVaultInfo: {
    marginLeft: 12,
    flex: 1,
  },
  modalVaultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalVaultDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalTimeVaultMaturity: {
    fontSize: 14,
    color: '#2563eb',
  },
  modalVaultRight: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'flex-end',
  },
  modalVaultApy: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  modalVaultApyLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalVaultBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalVaultTvl: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalVaultRisk: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Deposit Modal Styles
  depositVaultHeader: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  depositVaultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  depositVaultText: {
    marginLeft: 12,
    flex: 1,
  },
  depositVaultName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  depositVaultDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  depositVaultHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  depositVaultStats: {
    flexDirection: 'row',
    gap: 16,
  },
  depositStatItem: {
    flex: 1,
  },
  depositStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  depositStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  depositProtocol: {
    marginTop: 12,
  },
  depositFeatures: {
    marginBottom: 24,
  },
  depositFeaturesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  depositFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  depositFeatureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
    marginRight: 12,
  },
  depositFeatureText: {
    fontSize: 14,
    color: '#374151',
  },
  depositSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  depositSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  depositSummaryLabel: {
    fontSize: 14,
    color: '#374151',
  },
  depositSummaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  depositSummaryMaturity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  depositSummaryReturn: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  depositActions: {
    flexDirection: 'row',
    gap: 12,
  },
  learnMoreButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  startSavingButton: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startSavingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});