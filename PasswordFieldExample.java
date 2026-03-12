

import java.awt.*;
import java.awt.event.ActionEvent;
import java.security.SecureRandom;
import javax.swing.*;

public class PasswordFieldExample extends JFrame {

    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SPECIAL = "!@#$%^&*()-_=+[]{}|;:'\",.<>?/~`";
    private static final SecureRandom random = new SecureRandom();

    private JTextField lengthField;
    private JCheckBox upperCheckBox, lowerCheckBox, digitsCheckBox, specialCheckBox;
    private JTextArea resultArea;

    public PasswordFieldExample () {
        setTitle("Password Generator");
        setSize(300, 200);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new GridLayout(5, 1));

        // Password length input
        JPanel lengthPanel = new JPanel();
        lengthPanel.add(new JLabel("Length:"));
        lengthField = new JTextField("12", 5);
        lengthPanel.add(lengthField);
        add(lengthPanel);

        // Checkbox options 
        upperCheckBox = new JCheckBox("Uppercase", true);
        lowerCheckBox = new JCheckBox("Lowercase", true);
        digitsCheckBox = new JCheckBox("Digits", true);
        specialCheckBox = new JCheckBox("Special", true);
        JPanel checkboxPanel = new JPanel();
        checkboxPanel.add(upperCheckBox);
        checkboxPanel.add(lowerCheckBox);
        checkboxPanel.add(digitsCheckBox);
        checkboxPanel.add(specialCheckBox);
        add(checkboxPanel);

        // Generate button
        JButton generateButton = new JButton("Generate");
        generateButton.addActionListener(this::generatePassword);
        add(generateButton);

        // Result display area
        resultArea = new JTextArea(2, 20);
        resultArea.setLineWrap(true);
        resultArea.setWrapStyleWord(true);
        resultArea.setEditable(false);
        add(new JScrollPane(resultArea));
    }

    private void generatePassword(ActionEvent e) {
        try {
            int length = Integer.parseInt(lengthField.getText());
            boolean useUpper = upperCheckBox.isSelected();
            boolean useLower = lowerCheckBox.isSelected();
            boolean useDigits = digitsCheckBox.isSelected();
            boolean useSpecial = specialCheckBox.isSelected();

            if (!useUpper && !useLower && !useDigits && !useSpecial) {
                throw new IllegalArgumentException("Select at least one character type.");
            }

            String charPool = (useUpper ? UPPER : "") + (useLower ? LOWER : "") +
                    (useDigits ? DIGITS : "") + (useSpecial ? SPECIAL : "");
            StringBuilder password = new StringBuilder();

            for (int i = 0; i < length; i++) {
                int randomIndex = random.nextInt(charPool.length());
                password.append(charPool.charAt(randomIndex));
            }

            resultArea.setText(password.toString());
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Enter a valid number for length.", "Error", JOptionPane.ERROR_MESSAGE);
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            PasswordFieldExample  frame = new PasswordFieldExample ();
            frame.setVisible(true);
        });
    }
}

