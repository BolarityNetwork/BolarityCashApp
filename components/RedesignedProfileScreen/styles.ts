import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Header
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  settingsIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  profileId: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
    marginBottom: 16,
  },

  // Current Wallet
  currentWalletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    width: '100%',
  },
  currentWalletInfo: {
    flex: 1,
  },
  currentWalletType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  currentWalletAddress: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  switchIcon: {
    fontSize: 20,
    color: '#667eea',
  },

  // Stats
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
  },

  // Network Info
  networkInfoContainer: {
    marginTop: 4,
  },
  networkDisplayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
  networkIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  networkName: {
    fontSize: 11,
    color: '#64748b',
    flex: 1,
  },
  networkSwitchIcon: {
    fontSize: 10,
    marginLeft: 4,
  },

  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },

  // Sections
  section: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  accountsBadge: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  accountsBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  expandIcon: {
    fontSize: 14,
    color: '#94a3b8',
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Wallet Section
  walletSection: {
    marginBottom: 20,
  },
  walletSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  activeWalletBadge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeWalletBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Wallet Card
  walletCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  walletCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  walletStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  walletStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  walletStatus: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  walletAddress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
    flex: 1,
  },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  copyIcon: {
    fontSize: 16,
  },
  walletButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  walletManageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dangerButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  walletManageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Wallet Creation
  walletCreate: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyWalletIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  walletCreateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  walletCreateDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },

  // Network Options
  networkSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  networkSelectorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  networkSelectorName: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
    fontWeight: '500',
  },
  networkSelectorArrow: {
    fontSize: 14,
    color: '#fff',
  },
  networkOption: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activeNetworkOption: {
    borderColor: '#667eea',
    borderWidth: 2,
  },
  networkOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  networkIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  networkOptionIcon: {
    fontSize: 24,
  },
  networkOptionInfo: {
    flex: 1,
  },
  networkOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  networkOptionDesc: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  networkOptionUrl: {
    fontSize: 11,
    color: '#9ca3af',
  },
  networkOptionCheck: {
    fontSize: 24,
    color: '#667eea',
    fontWeight: 'bold',
  },
  switchingIndicator: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  switchingText: {
    fontSize: 16,
    color: '#667eea',
    marginTop: 12,
    fontWeight: '500',
  },

  // Security Options
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  securityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  securityOptionIcon: {
    fontSize: 18,
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  securityDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  linkButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  viewButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },

  // Account Previews
  accountPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  accountIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  accountId: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  accountStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountStatusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  viewAllButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  linkNewSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  linkNewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  providerName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    marginLeft: 6,
  },

  // Sign Out
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fee2e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  signOutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  bottomPadding: {
    height: 20,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },

  // Settings
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },

  // Wallet Option
  walletOption: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activeWalletOption: {
    borderColor: '#667eea',
    borderWidth: 2,
  },
  walletOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  walletOptionInfo: {
    flex: 1,
  },
  walletOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  walletOptionAddress: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  walletOptionNetwork: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  walletOptionCheck: {
    fontSize: 20,
    color: '#667eea',
    fontWeight: 'bold',
  },
  createWalletSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  createWalletTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  createWalletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  createWalletText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },

  // Messages
  messageItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageIndex: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 8,
  },
  messageContent: {
    fontSize: 13,
    color: '#1e293b',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
