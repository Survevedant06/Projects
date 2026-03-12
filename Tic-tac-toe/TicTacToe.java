import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.*;

public class TicTacToe extends JFrame implements ActionListener {

    // 3x3 grid for the tic-tac-toe board
    private JButton[][] buttons = new JButton[3][3];
    // Tracks the current player: true for 'X', false for 'O'
    private boolean currentPlayer = true;

    public TicTacToe() {
        setTitle("Tic-Tac-Toe");
        setSize(400, 400);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new GridLayout(3, 3));

        // Initialize the grid buttons
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                buttons[i][j] = new JButton("");
                buttons[i][j].setFont(new Font("Arial", Font.PLAIN, 80));
                buttons[i][j].setFocusPainted(false);
                buttons[i][j].addActionListener(this);
                add(buttons[i][j]);
            }
        }

        setVisible(true);
    }

    @Override
    public void actionPerformed(ActionEvent e) {
        JButton buttonClicked = (JButton) e.getSource();

        // Check if the button is already clicked
        if (!buttonClicked.getText().equals("")) {
            return;
        }

        // Mark the current player's move
        buttonClicked.setText(currentPlayer ? "X" : "O");

        // Check for a winner or a draw
        if (checkForWinner()) {
            JOptionPane.showMessageDialog(this, "Player " + (currentPlayer ? "X" : "O") + " wins!");
            resetBoard();
        } else if (isBoardFull()) {
            JOptionPane.showMessageDialog(this, "It's a draw!");
            resetBoard();
        } else {
            // Switch player turn
            currentPlayer = !currentPlayer;
        }
    }

    private boolean checkForWinner() {
        // Check rows, columns, and diagonals for a winning combination
        for (int i = 0; i < 3; i++) {
            if (buttons[i][0].getText().equals(buttons[i][1].getText()) &&
                buttons[i][1].getText().equals(buttons[i][2].getText()) &&
                !buttons[i][0].getText().equals("")) {
                return true;
            }

            if (buttons[0][i].getText().equals(buttons[1][i].getText()) &&
                buttons[1][i].getText().equals(buttons[2][i].getText()) &&
                !buttons[0][i].getText().equals("")) {
                return true;
            }
        }

        if (buttons[0][0].getText().equals(buttons[1][1].getText()) &&
            buttons[1][1].getText().equals(buttons[2][2].getText()) &&
            !buttons[0][0].getText().equals("")) {
            return true;
        }

        if (buttons[0][2].getText().equals(buttons[1][1].getText()) &&
            buttons[1][1].getText().equals(buttons[2][0].getText()) &&
            !buttons[0][2].getText().equals("")) {
            return true;
        }

        return false;
    }

    private boolean isBoardFull() {
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                if (buttons[i][j].getText().equals("")) {
                    return false;
                }
            }
        }
        return true;
    }

    private void resetBoard() {
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                buttons[i][j].setText("");
            }
        }
        currentPlayer = true;
    }

    public static void main(String[] args) {
        new TicTacToe();
    }
}
